// Vercel Serverless Function — POST /api/coach
// Interpreta texto libre (rutina pegada o dolencia reportada) usando Groq
// y lo estructura contra el catálogo de ejercicios existente.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `Sos el motor de interpretación de ENGANCHE_OS, una app de entrenamiento.
Recibís: (1) un texto libre del usuario (puede ser una rutina pegada, o el reporte de una dolencia física),
y (2) el catálogo de ejercicios disponibles en la app (id, nombre, músculos, si tiene carga de sóleo, si es apto para priming).

Tu trabajo:
- Si el texto describe una RUTINA: la rutina puede cubrir UN solo día o VARIOS días de la semana (ej: "Lunes: ...,
  Miércoles: ..., Viernes: ..."). Separar el texto por cada día que el usuario mencione explícitamente. Si el texto
  NO menciona días de la semana (es una sola sesión suelta), devolver un único elemento con "day": null.
  Para cada día: separar cada ejercicio mencionado, matchearlo con el catálogo por nombre/significado (si hay un
  ejercicio parecido en el catálogo, usar ese "exercise_id"; si no existe, proponerlo como "new_exercise" con nombre,
  músculos estimados [usando el vocabulario: cuadriceps, isquiotibiales, gluteos, aductores, abductores, gemelos,
  soleo, core, oblicuos, transverso, lumbar, dorsales, trapecio, romboides, pectoral, deltoides, biceps, triceps,
  antebrazos, psoas, cardio], series y reps estimadas). Escribir un "objetivo" breve (1 frase) para cada día.
  Además escribir una "explicacion" general (2-4 frases) del criterio detrás de la distribución semanal completa.
- Si el texto describe una DOLENCIA (dolor, molestia, lesión): identificar la zona/músculos afectados con el mismo
  vocabulario, y listar qué ejercicios del catálogo dado deberían excluirse (por nombre e id) con el motivo, más
  alternativas seguras que sí estén en el catálogo.
- Siempre respondé en español, tono directo y técnico, sin rodeos.
- Usá exactamente estos valores para "day": "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo", o null.

Respondé EXCLUSIVAMENTE con un JSON válido (sin markdown, sin \`\`\`), con esta forma exacta:
{
  "type": "rutina" | "dolencia",
  "explicacion": "string",
  "dias": [
    {
      "day": "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo" | null,
      "objetivo": "string",
      "ejercicios": [
        { "exercise_id": "uuid o null", "new_exercise": null | { "name": "string", "muscles": ["string"], "default_sets": number, "default_reps": "string" }, "sets": number, "reps": "string" }
      ]
    }
  ],
  "dolencia": null | {
    "descripcion": "string",
    "muscles_affected": ["string"],
    "exclusions": [ { "exercise_id": "string", "name": "string", "motivo": "string" } ],
    "alternativas": [ { "exercise_id": "string", "name": "string", "motivo": "string" } ]
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

  const catalogSummary = (catalog || [])
    .map((e) => `${e.id}::${e.name}::[${(e.muscles || []).join(',')}]::soleo=${e.soleo_load}::priming=${e.priming_ok}`)
    .join('\n')

  const userPrompt = `CATÁLOGO DISPONIBLE:\n${catalogSummary}\n\nTEXTO DEL USUARIO:\n${text.trim()}`

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      res.status(502).json({ error: 'groq_error', detail: errText.slice(0, 500) })
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

    res.status(200).json(parsed)
  } catch (err) {
    res.status(500).json({ error: 'server_error', detail: String(err).slice(0, 300) })
  }
}
