import { useState } from 'react'
import { calcTargets } from '../../utils/calculations'
import { generateId } from '../../utils/storage'
import { X } from 'lucide-react'

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little/no exercise' },
  { value: 'light', label: 'Lightly active', desc: '1–3 days/week exercise' },
  { value: 'moderate', label: 'Moderate', desc: '3–5 days/week exercise' },
  { value: 'active', label: 'Very active', desc: '6–7 days/week hard exercise' },
  { value: 'very_active', label: 'Athlete', desc: 'Physical job + training' },
]

const GOALS = [
  { value: 'lose', label: 'Lose weight', desc: '20% calorie deficit' },
  { value: 'maintain', label: 'Maintain weight', desc: 'Balanced calories' },
  { value: 'gain', label: 'Gain muscle', desc: '10% calorie surplus' },
  { value: 'fitness', label: 'Improve fitness', desc: '5% calorie surplus' },
]

const DIET_PREFS = ['Vegetarian', 'Vegan', 'Non-veg', 'Gluten-free', 'Dairy-free', 'Keto', 'Diabetic-friendly']
const HEALTH_CONDITIONS = ['Diabetes', 'Hypertension', 'High cholesterol', 'PCOS', 'Thyroid', 'Lactose intolerant']

const BLANK = {
  name: '', age: '', gender: 'male', height: '', weight: '',
  activityLevel: 'moderate', goal: 'maintain', targetWeight: '',
  dietaryPrefs: [], healthConditions: []
}

export default function ProfileForm({ existing, onSave, onCancel }) {
  const [form, setForm] = useState(existing ? {
    ...existing,
    age: String(existing.age),
    height: String(existing.height),
    weight: String(existing.weight),
    targetWeight: String(existing.targetWeight || '')
  } : BLANK)
  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleList = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val]
    }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.age || isNaN(form.age) || +form.age < 5 || +form.age > 120) e.age = 'Enter valid age'
    if (!form.height || isNaN(form.height) || +form.height < 50) e.height = 'Enter height in cm'
    if (!form.weight || isNaN(form.weight) || +form.weight < 20) e.weight = 'Enter weight in kg'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const profile = {
      id: existing?.id || generateId(),
      name: form.name.trim(),
      age: +form.age,
      gender: form.gender,
      height: +form.height,
      weight: +form.weight,
      activityLevel: form.activityLevel,
      goal: form.goal,
      targetWeight: form.targetWeight ? +form.targetWeight : null,
      dietaryPrefs: form.dietaryPrefs,
      healthConditions: form.healthConditions,
      createdAt: existing?.createdAt || new Date().toISOString()
    }
    profile.targets = calcTargets(profile)
    onSave(profile)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{existing ? 'Edit Profile' : 'New Profile'}</h2>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-200">
          <X size={20} />
        </button>
      </div>

      {/* Basic info */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic Info</div>
        <div>
          <label className="label">Name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter name" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Age</label>
            <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="Years" />
            {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
          </div>
          <div>
            <label className="label">Gender</label>
            <select value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Height (cm)</label>
            <input type="number" value={form.height} onChange={e => set('height', e.target.value)} placeholder="175" />
            {errors.height && <p className="text-red-400 text-xs mt-1">{errors.height}</p>}
          </div>
          <div>
            <label className="label">Weight (kg)</label>
            <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="70" />
            {errors.weight && <p className="text-red-400 text-xs mt-1">{errors.weight}</p>}
          </div>
        </div>
      </div>

      {/* Activity level */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity Level</div>
        {ACTIVITY_LEVELS.map(a => (
          <button key={a.value}
            onClick={() => set('activityLevel', a.value)}
            className={`w-full text-left p-3 rounded-xl border transition-colors ${
              form.activityLevel === a.value
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}>
            <div className="font-medium text-sm">{a.label}</div>
            <div className="text-xs text-slate-400">{a.desc}</div>
          </button>
        ))}
      </div>

      {/* Goal */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Goal</div>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <button key={g.value}
              onClick={() => set('goal', g.value)}
              className={`text-left p-3 rounded-xl border transition-colors ${
                form.goal === g.value
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}>
              <div className="font-medium text-sm">{g.label}</div>
              <div className="text-xs text-slate-400">{g.desc}</div>
            </button>
          ))}
        </div>
        {(form.goal === 'lose' || form.goal === 'gain') && (
          <div>
            <label className="label">Target weight (kg) — optional</label>
            <input type="number" value={form.targetWeight} onChange={e => set('targetWeight', e.target.value)} placeholder="e.g. 65" />
          </div>
        )}
      </div>

      {/* Dietary prefs */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dietary Preferences</div>
        <div className="flex flex-wrap gap-2">
          {DIET_PREFS.map(p => (
            <button key={p}
              onClick={() => toggleList('dietaryPrefs', p)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                form.dietaryPrefs.includes(p)
                  ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Health conditions */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Conditions</div>
        <div className="flex flex-wrap gap-2">
          {HEALTH_CONDITIONS.map(c => (
            <button key={c}
              onClick={() => toggleList('healthConditions', c)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                form.healthConditions.includes(c)
                  ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} className="btn-primary">
        Save Profile
      </button>
    </div>
  )
}
