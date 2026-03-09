import { useState } from 'react'
import { Plus, Pencil, Trash2, Target, Flame, Dumbbell, Wheat } from 'lucide-react'
import ProfileForm from './ProfileForm'
import { saveProfile, deleteProfile } from '../../utils/storage'
import { calcBMI, bmiCategory } from '../../utils/calculations'

function MacroChip({ label, value, unit = 'g', color }) {
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-xl ${color}`}>
      <span className="text-xs text-slate-400">{label}</span>
      <span className="font-bold text-sm">{value}{unit}</span>
    </div>
  )
}

function ProfileCard({ profile, isActive, onEdit, onDelete }) {
  const bmi = calcBMI(profile.weight, profile.height)
  const bmiInfo = bmiCategory(parseFloat(bmi))
  const t = profile.targets || {}

  const goalLabels = { lose: 'Lose weight', maintain: 'Maintain', gain: 'Gain muscle', fitness: 'Improve fitness' }

  return (
    <div className={`card space-y-4 ${isActive ? 'border-brand-500/50' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{profile.name}</h3>
            {isActive && (
              <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Active</span>
            )}
          </div>
          <div className="text-sm text-slate-400 mt-0.5">
            {profile.age}y • {profile.gender} • {profile.height}cm • {profile.weight}kg
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Target size={14} className="text-brand-400" />
            <span className="text-sm text-slate-300">{goalLabels[profile.goal]}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg">
            <Pencil size={16} />
          </button>
          <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* BMI */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">BMI {bmi}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 ${bmiInfo.color}`}>
          {bmiInfo.label}
        </span>
      </div>

      {/* Targets */}
      {t.calories && (
        <div>
          <div className="text-xs text-slate-500 mb-2">Daily targets</div>
          <div className="grid grid-cols-4 gap-2">
            <MacroChip label="Calories" value={t.calories} unit=" kcal" color="bg-orange-500/10" />
            <MacroChip label="Protein" value={t.protein} color="bg-purple-500/10" />
            <MacroChip label="Carbs" value={t.carbs} color="bg-yellow-500/10" />
            <MacroChip label="Fat" value={t.fat} color="bg-blue-500/10" />
          </div>
        </div>
      )}

      {/* Tags */}
      {(profile.dietaryPrefs?.length > 0 || profile.healthConditions?.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {profile.dietaryPrefs?.map(p => (
            <span key={p} className="text-xs bg-brand-500/10 text-brand-300 px-2 py-0.5 rounded-full">{p}</span>
          ))}
          {profile.healthConditions?.map(c => (
            <span key={c} className="text-xs bg-orange-500/10 text-orange-300 px-2 py-0.5 rounded-full">{c}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProfileTab({ profiles, activeProfileId, onProfilesChange, onProfileChange }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleSave = (profile) => {
    saveProfile(profile)
    const updated = profiles.find(p => p.id === profile.id)
      ? profiles.map(p => p.id === profile.id ? profile : p)
      : [...profiles, profile]
    onProfilesChange(updated)
    if (!activeProfileId) onProfileChange(profile.id)
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = (id) => {
    deleteProfile(id)
    const updated = profiles.filter(p => p.id !== id)
    onProfilesChange(updated)
    if (activeProfileId === id) onProfileChange(updated[0]?.id || null)
    setConfirmDelete(null)
  }

  if (showForm || editing) {
    return (
      <div>
        <ProfileForm
          existing={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Profiles</h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} />
          Add
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="text-4xl">👤</div>
          <p className="text-slate-400">No profiles yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary max-w-xs mx-auto">
            Create your first profile
          </button>
        </div>
      ) : (
        profiles.map(p => (
          <div key={p.id}>
            <ProfileCard
              profile={p}
              isActive={p.id === activeProfileId}
              onEdit={() => setEditing(p)}
              onDelete={() => setConfirmDelete(p.id)}
            />
            {confirmDelete === p.id && (
              <div className="mt-2 p-4 bg-red-900/20 border border-red-800 rounded-xl space-y-3">
                <p className="text-sm text-red-300">Delete {p.name}? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(p.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-sm font-semibold">
                    Delete
                  </button>
                  <button onClick={() => setConfirmDelete(null)}
                    className="flex-1 btn-secondary py-2">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
