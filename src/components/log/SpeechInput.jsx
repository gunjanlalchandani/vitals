import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'

export default function SpeechInput({ onResult }) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recRef = useRef(null)

  const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  const toggle = () => {
    if (listening) {
      recRef.current?.stop()
      setListening(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Speech not supported in this browser'); return }

    const rec = new SR()
    rec.lang = 'en-IN'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      onResult(text)
      setListening(false)
    }
    rec.onerror = (e) => {
      setError(e.error === 'not-allowed' ? 'Mic permission denied' : 'Speech error: ' + e.error)
      setListening(false)
    }
    rec.onend = () => setListening(false)

    recRef.current = rec
    rec.start()
    setListening(true)
    setError('')
  }

  if (!supported) return null

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className={`p-2.5 rounded-xl border transition-colors ${
          listening
            ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-brand-500 hover:text-brand-400'
        }`}
      >
        {listening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
      {listening && <span className="text-xs text-red-400">Listening...</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
