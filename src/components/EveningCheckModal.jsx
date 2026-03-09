import { useState } from 'react'
import { Check, X, ChefHat } from 'lucide-react'
import RecipeModal from './diet/RecipeModal'
import { getDietPlan, saveDietPlan, tomorrow, getDayName } from '../utils/storage'

const MEAL_LABELS = {
  preBreakfast: 'Pre-breakfast', breakfast: 'Breakfast',
  postBreakfast: 'Post-breakfast', lunch: 'Lunch',
  evening: 'Evening snack', dinner: 'Dinner'
}

export default function EveningCheckModal({ profile, onClose }) {
  const tmr = tomorrow()
  const dayName = getDayName(tmr)
  const plan = getDietPlan(profile?.id)
  const dayPlan = plan?.[dayName] || {}

  const [editMeal, setEditMeal] = useState(null)

  const handleMealUpdate = (item) => {
    const updated = {
      ...plan,
      [dayName]: { ...dayPlan, [editMeal]: item }
    }
    saveDietPlan(profile.id, updated)
    setEditMeal(null)
  }

  const mealCalTarget = Math.round((profile?.targets?.calories || 2000) / 6)

  if (editMeal) {
    return (
      <RecipeModal
        mealType={editMeal}
        targetCalories={mealCalTarget}
        profile={profile}
        onSelect={handleMealUpdate}
        onClose={() => setEditMeal(null)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur flex flex-col p-4 pt-safe">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <div className="text-center pt-8 pb-6">
          <div className="text-4xl mb-3">🌙</div>
          <h2 className="text-xl font-bold">Tomorrow's food plan</h2>
          <p className="text-slate-400 text-sm mt-1 capitalize">{dayName} · {tmr}</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {Object.keys(MEAL_LABELS).map(meal => {
            const m = dayPlan[meal]
            return (
              <div key={meal} className="card flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400">{MEAL_LABELS[meal]}</div>
                  {m ? (
                    <>
                      <div className="font-medium text-sm">{m.dish}</div>
                      <div className="text-xs text-slate-500">{m.calories} kcal</div>
                    </>
                  ) : (
                    <div className="text-sm text-slate-500 italic">Not planned</div>
                  )}
                </div>
                <button onClick={() => setEditMeal(meal)}
                  className="p-2 text-slate-500 hover:text-brand-400 hover:bg-slate-800 rounded-lg">
                  <ChefHat size={16} />
                </button>
              </div>
            )
          })}
        </div>

        <div className="pt-4 space-y-3 pb-safe">
          <button onClick={onClose}
            className="btn-primary flex items-center justify-center gap-2">
            <Check size={18} />Looks good, I'm set!
          </button>
          <button onClick={onClose} className="btn-ghost w-full text-center">
            Remind me later
          </button>
        </div>
      </div>
    </div>
  )
}
