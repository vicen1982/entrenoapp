import { useEffect, useState } from 'react'
import { photoIdFor, photoUrls } from './exercisePhotos'
import MovementDemo from './MovementDemo'

/*
 * Demostración visual del ejercicio: alterna las dos fotos reales (posición
 * inicial y final) para que se lea el movimiento, como un GIF. Si el ejercicio
 * no tiene foto en la base pública, cae en la figura esquemática animada.
 */

export default function ExercisePhoto({ exercise, size = 130, showLabel = true }) {
  const id = photoIdFor(exercise)
  const urls = photoUrls(id)
  const [frame, setFrame] = useState(0)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setFrame(0)
    setFailed(false)
    setLoaded(false)
  }, [id])

  useEffect(() => {
    if (!id || failed) return
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 1300)
    return () => clearInterval(t)
  }, [id, failed])

  if (!id || failed) {
    return <MovementDemo exercise={exercise} size={size} showLabel={showLabel} />
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative rounded-2xl border border-panel-border overflow-hidden bg-panel-bg"
        style={{ width: size, height: size }}
      >
        {urls.map((u, i) => (
          <img
            key={u}
            src={u}
            alt=""
            onLoad={() => i === 0 && setLoaded(true)}
            onError={() => setFailed(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: frame === i ? 1 : 0 }}
          />
        ))}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-panel-border border-t-neon-green animate-spin" />
          </div>
        )}
        {/* indicador de fase */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                frame === i ? 'bg-neon-green' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
      {showLabel && (
        <span className="text-[9px] text-slate-500 tracking-widest font-mono">EJECUCIÓN</span>
      )}
    </div>
  )
}
