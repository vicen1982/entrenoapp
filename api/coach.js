// Vercel Serverless Function — POST /api/coach
// Interpreta texto libre (rutina pegada o dolencia reportada) usando Groq
// y lo estructura contra el catálogo de ejercicios existente.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
// El 70b interpreta mejor las rutinas, pero el tier gratuito lo corta a 100k
// tokens/día. El 8b tiene una cuota diaria mucho más alta y separada, así que
// sirve de respaldo para no dejar al usuario sin poder cargar su rutina.
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_FALLBACK_MODEL = 'llama-3.1-8b-instant'

// Una rutina semanal larga puede tardar ~10s en generarse, y el reintento por
// rate limit suma unos segundos más: sin esto Vercel cortaría con un 502 vacío.
export const config = { maxDuration: 60 }

const SYSTEM_PROMPT = `Sos el motor de interpretación de ENGANCHE_OS, una app de entrenamiento.
Recibís: (1) un texto libre del usuario (puede ser una rutina pegada, o el reporte de una dolencia física),
y (2) el catálogo de ejercicios disponibles en la app (id, nombre, músculos, si tiene carga de sóleo, si es apto para priming).

Las rutinas del usuario suelen venir como una tabla con columnas: Día, Módulo Táctico (un nombre libre puesto por su
entrenador, ej: "Descompresión", "Pliometría Rotacional", "Armadura Inestable" — NO es el mismo vocabulario que las
categorías del catálogo), Ejercicio, Volumen/Dinámica (series x reps, o rondas/circuito), Peso Sugerido, y Notas
Biomecánicas (la explicación técnica de cómo ejecutar el movimiento — esto es CRÍTICO, nunca lo resumas ni lo
descartes, cópialo casi textual). Algunas filas combinan varios movimientos en un circuito (ej: "Bici Sprint 30s +
Escalera 30s + Slams 12 reps, 4 Rondas") — esa fila completa es SIEMPRE UN SOLO elemento del array "ejercicios"
(NUNCA la separes en varios ítems), con "new_exercise.name" describiendo el circuito entero (ej: "Circuito: Bici +
Escalera + Slams"), "sets" = cantidad de rondas, "reps" = "circuito" o un resumen cortísimo, y "notas" con el
desglose completo de los componentes y sus tiempos/reps individuales.

Tu trabajo:
- Si el texto describe una RUTINA: la rutina puede cubrir UN solo día o VARIOS días de la semana (ej: "Lunes: ...,
  Miércoles: ..., Viernes: ..."). Separar el texto por cada día que el usuario mencione explícitamente. Si el texto
  NO menciona días de la semana (es una sola sesión suelta), devolver un único elemento con "day": null.
  Para cada día: separar cada ejercicio/fila mencionado, matchearlo con el catálogo por nombre/significado (si hay
  un ejercicio parecido en el catálogo, usar su NÚMERO de índice en "ref"; si no existe o es una variante/circuito nuevo,
  proponerlo como "new_exercise" con nombre, músculos estimados [usando el vocabulario: cuadriceps, isquiotibiales,
  gluteos, aductores, abductores, gemelos, soleo, core, oblicuos, transverso, lumbar, dorsales, trapecio, romboides,
  pectoral, deltoides, biceps, triceps, antebrazos, psoas, cardio], series y reps estimadas).
  Para cada ejercicio incluí también, si el texto los menciona: "modulo_tactico" (el nombre libre de la columna
  Módulo Táctico), "peso_sugerido" (texto tal cual, ej: "20-24 kg /manc." o "Peso Corporal" o "Cero"), y "notas"
  (las notas biomecánicas/de ejecución, lo más fiel posible al texto original — nunca vacío si el usuario las dio).
  Escribir un "objetivo" breve (1 frase) para cada día.
  Además escribir una "explicacion" general (2-4 frases) del criterio/fundamento detrás de la distribución semanal
  completa (si el usuario incluyó un párrafo de fundamento o razón de la rutina, resumilo ahí).
- Si el texto describe una DOLENCIA (dolor, molestia, lesión): identificar la zona/músculos afectados con el mismo
  vocabulario, y listar qué ejercicios del catálogo dado deberían excluirse (por nombre y número de índice en "ref")
  con el motivo, más alternativas seguras que sí estén en el catálogo.
- Siempre respondé en español, tono directo y técnico, sin rodeos.
- Usá exactamente estos valores para "day": "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo", o null.
- "ref" es SIEMPRE el número entero que precede al nombre en el catálogo (ej: 12), nunca un texto ni un uuid.
- IMPORTANTE con "sets" y "reps": la app los muestra juntos como "sets×reps", así que NO repitas el número de
  series dentro de "reps". De "4 x 5 /lado" → sets=4, reps="5 /lado" (NO "4 x 5 /lado"). De "3 x 8 /pierna" →
  sets=3, reps="8 /pierna". De "4 Rondas" → sets=4, reps="rondas". De "3 series" → sets=3, reps="".
  De "3 x 15 metros" → sets=3, reps="15 metros".

Respondé EXCLUSIVAMENTE con un JSON válido (sin markdown, sin \`\`\`), con esta forma exacta:
{
  "type": "rutina" | "dolencia",
  "explicacion": "string",
  "dias": [
    {
      "day": "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo" | null,
      "objetivo": "string",
      "ejercicios": [
        {
          "ref": number | null,
          "new_exercise": null | { "name": "string", "muscles": ["string"], "default_sets": number, "default_reps": "string" },
          "sets": number,
          "reps": "string",
          "modulo_tactico": "string o null",
          "peso_sugerido": "string o null",
          "notas": "string o null"
        }
      ]
    }
  ],
  "dolencia": null | {
    "descripcion": "string",
    "muscles_affected": ["string"],
    "exclusions": [ { "ref": number, "name": "string", "motivo": "string" } ],
    "alternativas": [ { "ref": number, "name": "string", "motivo": "string" } ]
  }
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'missing_api_key' })
    return
  }

  const { text, catalog } = req.body || {}
  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'missing_text' })
    return
  }

  // Se numera el catálogo en vez de mandar UUIDs: cada UUID cuesta ~12 tokens y
  // son 57 ejercicios, así que el índice ahorra ~700 tokens de entrada por
  // request — decisivo contra el límite de 12k tokens/minuto del tier gratuito.
  const list = catalog || []
  const catalogSummary = list.map((e, i) => `${i}::${e.name}`).join('\n')

  const userPrompt = `CATÁLOGO DISPONIBLE:\n${catalogSummary}\n\nTEXTO DEL USUARIO:\n${text.trim()}`

  const callGroq = (model) =>
    fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        // Groq reserva max_tokens contra el límite de 12k tokens/minuto del tier
        // gratuito, así que pedir de más hacía fallar la request entera. Una
        // rutina de 3 días ocupa ~1.2k tokens: 3000 deja margen de sobra.
        max_tokens: 3000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

  try {
    // No se reintenta con el mismo modelo: el límite es por tokens consumidos,
    // así que insistir sólo gasta más cuota. Si el 70b está agotado se pasa al
    // 8b, que tiene su propia cuota, antes de dar el error al usuario.
    const isQuota = (s) => s === 429 || s === 413
    let groqRes = await callGroq(GROQ_MODEL)
    let usedFallback = false
    if (isQuota(groqRes.status)) {
      groqRes = await callGroq(GROQ_FALLBACK_MODEL)
      usedFallback = true
    }

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      const quota = isQuota(groqRes.status) || /tokens per|too large|rate.?limit/i.test(errText)
      // Groq indica cuánto falta ("Please try again in 16m47s"): se lo pasamos
      // al usuario para que no reintente a ciegas.
      const wait = errText.match(/try again in ([0-9hms.]+)/i)?.[1] ?? null
      res
        .status(quota ? 429 : 502)
        .json({
          error: quota ? 'rate_limited' : 'groq_error',
          retry_after: wait,
          detail: errText.slice(0, 500),
        })
      return
    }

    const data = await groqRes.json()
    const raw = data.choices?.[0]?.message?.content
    if (!raw) {
      res.status(502).json({ error: 'empty_response' })
      return
    }

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      res.status(502).json({ error: 'invalid_json', raw: raw.slice(0, 500) })
      return
    }

    // Traducimos los índices del catálogo de vuelta a UUIDs para que el resto de
    // la app siga trabajando con exercise_id como siempre.
    const uuidOf = (ref) => {
      const i = typeof ref === 'number' ? ref : parseInt(ref, 10)
      return Number.isInteger(i) && list[i] ? list[i].id : null
    }
    // El modelo a veces devuelve "miércoles"/"sábado" con tilde; el resto de la
    // app compara contra claves sin tilde, así que normalizamos acá.
    const normalizeDay = (d) =>
      typeof d === 'string'
        ? d.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
        : d

    for (const dia of parsed.dias || []) {
      dia.day = normalizeDay(dia.day)
      for (const ej of dia.ejercicios || []) {
        ej.exercise_id = ej.ref === null || ej.ref === undefined ? null : uuidOf(ej.ref)
        delete ej.ref
      }
    }
    if (parsed.dolencia) {
      for (const key of ['exclusions', 'alternativas']) {
        for (const item of parsed.dolencia[key] || []) {
          item.exercise_id = uuidOf(item.ref)
          delete item.ref
        }
      }
    }

    res.status(200).json(parsed)
  } catch (err) {
    res.status(500).json({ error: 'server_error', detail: String(err).slice(0, 300) })
  }
}
