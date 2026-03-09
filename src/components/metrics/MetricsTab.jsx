import { useState, useEffect } from 'react'
import { Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getMetrics, saveMetricEntry, today } from '../../utils/storage'
import { calcBMI, bmiCategory } from '../../utils/calculations'

const BLANK = { weight: '', waist: '', hips: '', chest: '', notes: '' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value} {p.dataKey === 'weight' ? 'kg' : 'cm'}
        </p>
      ))}
    </div>
  )
}

export default function MetricsTab({ profile }) {
  const [metrics, setMetrics] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ ...BLANK, date: today() })
  const [activeChart, setActiveChart] = useState('weight')

  useEffect(() => {
    if (!profile) return
    setMetrics(getMetrics(profile.id))
  }, [profile])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = () => {
    if (!form.weight) return
    const entry = {
      date: form.date,
      weight: +form.weight || null,
      waist: +form.waist || null,
      hips: +form.hips || null,
      chest: +form.chest || null,
      notes: form.notes.trim()
    }
    saveMetricEntry(profile.id, entry)
    const updated = getMetrics(profile.id)
    setMetrics(updated)
    setForm({ ...BLANK, date: today() })
    setShowAdd(false)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        Select a profile to track metrics
      </div>
    )
  }

  const latest = metrics[metrics.length - 1]
  const prev = metrics[metrics.length - 2]
  const weightChange = latest && prev ? (latest.weight - prev.weight).toFixed(1) : null
  const bmi = latest ? calcBMI(latest.weight, profile.height) : calcBMI(profile.weight, profile.height)
  const bmiInfo = bmiCategory(parseFloat(bmi))

  const CHARTS = [
    { key: 'weight', label: 'Weight', color: '#10b981', unit: 'kg' },
    { key: 'waist', label: 'Waist', color: '#f59e0b', unit: 'cm' },
    { key: 'hips', label: 'Hips', color: '#8b5cf6', unit: 'cm' },
    { key: 'chest', label: 'Chest', color: '#3b82f6', unit: 'cm' },
  ]

  const chartData = metrics
    .filter(m => m[activeChart])
    .map(m => ({
      date: new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      [activeChart]: m[activeChart]
    }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Metrics</h2>
        <button onClick={() => setShowAdd(o => !o)}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white
                     text-sm font-semibold px-3 py-2 rounded-xl transition-colors">
          <Plus size={16} />Log
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card space-y-3">
          <div className="text-sm font-semibold">Add entry</div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} max={today()} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Weight (kg) *</label>
              <input type="number" step="0.1" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="70.5" />
            </div>
            <div>
              <label className="label">Waist (cm)</label>
              <input type="number" step="0.5" value={form.waist} onChange={e => set('waist', e.target.value)} placeholder="80" />
            </div>
            <div>
              <label className="label">Hips (cm)</label>
              <input type="number" step="0.5" value={form.hips} onChange={e => set('hips', e.target.value)} placeholder="95" />
            </div>
            <div>
              <label className="label">Chest (cm)</label>
              <input type="number" step="0.5" value={form.chest} onChange={e => set('chest', e.target.value)} placeholder="90" />
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="e.g. Post morning workout" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.weight} className="btn-primary">Save</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="text-xs text-slate-400 mb-1">Current weight</div>
          <div className="text-2xl font-bold">{latest?.weight || profile.weight} <span className="text-sm text-slate-400">kg</span></div>
          {weightChange !== null && (
            <div className={`flex items-center gap-1 text-sm mt-1 ${
              +weightChange < 0 ? 'text-green-400' : +weightChange > 0 ? 'text-red-400' : 'text-slate-400'
            }`}>
              {+weightChange < 0 ? <TrendingDown size={14} /> : +weightChange > 0 ? <TrendingUp size={14} /> : <Minus size={14} />}
              {weightChange > 0 ? '+' : ''}{weightChange} kg
            </div>
          )}
        </div>
        <div className="card">
          <div className="text-xs text-slate-400 mb-1">BMI</div>
          <div className="text-2xl font-bold">{bmi}</div>
          <div className={`text-sm mt-1 font-medium ${bmiInfo.color}`}>{bmiInfo.label}</div>
        </div>
        {profile.targetWeight && (
          <div className="card col-span-2">
            <div className="text-xs text-slate-400 mb-1">Progress to goal</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{latest?.weight || profile.weight} kg</span>
              <span className="text-slate-500 text-sm">→ {profile.targetWeight} kg</span>
            </div>
            <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{
                width: `${Math.min(100, Math.max(0,
                  ((profile.weight - (latest?.weight || profile.weight)) /
                  (profile.weight - profile.targetWeight)) * 100
                ))}%`
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {metrics.length > 1 && (
        <div className="card space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CHARTS.map(c => (
              <button key={c.key}
                onClick={() => setActiveChart(c.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeChart === c.key
                    ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                    : 'border-slate-700 text-slate-400'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={activeChart}
                stroke={CHARTS.find(c => c.key === activeChart)?.color || '#10b981'}
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      {metrics.length > 0 && (
        <div className="card">
          <div className="text-sm font-semibold mb-3">History</div>
          <div className="space-y-0">
            {[...metrics].reverse().slice(0, 10).map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
                <div className="text-sm text-slate-400">
                  {new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex gap-3 text-sm">
                  {m.weight && <span className="font-medium">{m.weight} kg</span>}
                  {m.waist && <span className="text-slate-400">{m.waist}cm waist</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {metrics.length === 0 && !showAdd && (
        <div className="card text-center py-12 space-y-3">
          <div className="text-4xl">📊</div>
          <p className="text-slate-400 text-sm">No metrics logged yet</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary max-w-xs mx-auto">
            Log first entry
          </button>
        </div>
      )}
    </div>
  )
}
