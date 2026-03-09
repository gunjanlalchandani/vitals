import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import SpeechInput from './SpeechInput'
import { getDailyLog, saveDailyLog, today } from '../../utils/storage'
import { sumMeals } from '../../utils/calculations'

const MEALS = ['preBreakfast', 'breakfast', 'postBreakfast', 'lunch', 'evening', 'dinner']
const MEAL_LABELS = {
  preBreakfast: 'Pre-breakfast', breakfast: 'Breakfast',
  postBreakfast: 'Post-breakfast', lunch: 'Lunch',
  evening: 'Evening snack', dinner: 'Dinner'
}
const MEAL_ICONS = {
  preBreakfast: '🌅', breakfast: '🍳',
  postBreakfast: '🥜', lunch: '🍱',
  evening: '☕', dinner: '🌙'
}

const BLANK_ENTRY = { dish: '', quantity: '', calories: '', protein: '', carbs: '', fat: '' }

function EntryRow({ entry, onDelete }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-slate-800/60 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{entry.dish}</div>
        {entry.quantity && <div className="text-xs text-slate-500">{entry.quantity}</div>}
        <div className="flex gap-2 text-[10px] text-slate-500 mt-0.5">
          {entry.calories > 0 && <span>{entry.calories} kcal</span>}
          {entry.protein > 0 && <span>P {entry.protein}g</span>}
          {entry.carbs > 0 && <span>C {entry.carbs}g</span>}
          {entry.fat > 0 && <span>F {entry.fat}g</span>}
        </div>
      </div>
      <button onClick={onDelete} className="p-1.5 text-slate-600 hover:text-red-400">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function AddEntryForm({ onAdd }) {
  const [form, setForm] = useState(BLANK_ENTRY)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSpeech = (text) => {
    // Parse speech: "200 grams poha 250 calories"
    set('dish', text)
  }

  const handleAdd = () => {
    if (!form.dish.trim()) return
    onAdd({
      dish: form.dish.trim(),
      quantity: form.quantity.trim(),
      calories: +form.calories || 0,
      protein: +form.protein || 0,
      carbs: +form.carbs || 0,
      fat: +form.fat || 0,
    })
    setForm(BLANK_ENTRY)
  }

  return (
    <div className="space-y-3 pt-3 border-t border-slate-800">
      <div className="flex gap-2">
        <input
          value={form.dish}
          onChange={e => set('dish', e.target.value)}
          placeholder="Dish name (e.g. Poha)"
          className="flex-1"
        />
        <SpeechInput onResult={(text) => set('dish', text)} />
      </div>
      <input
        value={form.quantity}
        onChange={e => set('quantity', e.target.value)}
        placeholder="Quantity (e.g. 1 bowl, 200g) — optional"
      />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={form.calories} onChange={e => set('calories', e.target.value)} placeholder="Calories" />
        <input type="number" value={form.protein} onChange={e => set('protein', e.target.value)} placeholder="Protein (g)" />
        <input type="number" value={form.carbs} onChange={e => set('carbs', e.target.value)} placeholder="Carbs (g)" />
        <input type="number" value={form.fat} onChange={e => set('fat', e.target.value)} placeholder="Fat (g)" />
      </div>
      <button onClick={handleAdd} disabled={!form.dish.trim()} className="btn-primary py-2.5">
        <Plus size={16} className="inline mr-1.5" />Add entry
      </button>
    </div>
  )
}

function MealSection({ meal, entries, onAdd, onDelete }) {
  const [open, setOpen] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const total = entries.reduce((s, e) => s + (e.calories || 0), 0)

  return (
    <div className="card">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{MEAL_ICONS[meal]}</span>
          <span className="font-semibold">{MEAL_LABELS[meal]}</span>
          {entries.length > 0 && (
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {entries.length} items
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && <span className="text-xs text-orange-400 font-medium">{total} kcal</span>}
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="mt-3">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-2">Nothing logged yet</p>
          ) : (
            entries.map((entry, i) => (
              <EntryRow key={i} entry={entry} onDelete={() => onDelete(i)} />
            ))
          )}

          {showAdd ? (
            <>
              <AddEntryForm onAdd={(entry) => { onAdd(entry); setShowAdd(false) }} />
              <button onClick={() => setShowAdd(false)} className="btn-ghost w-full mt-2">Cancel</button>
            </>
          ) : (
            <button onClick={() => setShowAdd(true)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm text-brand-400
                         hover:text-brand-300 py-2 border border-dashed border-brand-500/30 rounded-xl
                         hover:border-brand-500/60 transition-colors">
              <Plus size={14} />Log a dish
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function DailyLogTab({ profile }) {
  const [date, setDate] = useState(today())
  const [log, setLog] = useState({ meals: {}, water: 0 })

  useEffect(() => {
    if (!profile) return
    setLog(getDailyLog(profile.id, date))
  }, [profile, date])

  const updateLog = (updated) => {
    setLog(updated)
    saveDailyLog(profile.id, date, updated)
  }

  const addEntry = (meal, entry) => {
    const meals = { ...log.meals }
    if (!meals[meal]) meals[meal] = []
    meals[meal] = [...meals[meal], entry]
    updateLog({ ...log, meals })
  }

  const deleteEntry = (meal, idx) => {
    const meals = { ...log.meals }
    meals[meal] = meals[meal].filter((_, i) => i !== idx)
    updateLog({ ...log, meals })
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        Select a profile to log meals
      </div>
    )
  }

  const totals = sumMeals(log.meals || {})
  const targets = profile.targets || {}

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Daily Log</h2>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="text-sm py-2 px-3 w-auto"
          max={today()}
        />
      </div>

      {/* Daily totals */}
      <div className="card">
        <div className="text-xs text-slate-500 mb-3">Today's totals</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Calories', val: totals.calories, target: targets.calories, unit: '', color: 'text-orange-400' },
            { label: 'Protein', val: totals.protein, target: targets.protein, unit: 'g', color: 'text-purple-400' },
            { label: 'Carbs', val: totals.carbs, target: targets.carbs, unit: 'g', color: 'text-yellow-400' },
            { label: 'Fat', val: totals.fat, target: targets.fat, unit: 'g', color: 'text-blue-400' },
          ].map(({ label, val, target, unit, color }) => (
            <div key={label} className="bg-slate-800 rounded-xl py-2">
              <div className={`font-bold text-sm ${color}`}>{val}{unit}</div>
              <div className="text-[10px] text-slate-500">{label}</div>
              {target > 0 && (
                <div className="text-[10px] text-slate-600">/ {target}{unit}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Meal sections */}
      <div className="space-y-3">
        {MEALS.map(meal => (
          <MealSection
            key={meal}
            meal={meal}
            entries={log.meals?.[meal] || []}
            onAdd={(entry) => addEntry(meal, entry)}
            onDelete={(idx) => deleteEntry(meal, idx)}
          />
        ))}
      </div>
    </div>
  )
}
