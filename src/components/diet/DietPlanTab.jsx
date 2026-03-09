import { useState, useEffect } from 'react'
import { Loader2, Sparkles, Pencil, ChevronDown, ChevronUp, RefreshCw, BookOpen } from 'lucide-react'
import { getDietPlan, saveDietPlan, getSavedRecipes } from '../../utils/storage'
import { generateWeeklyPlan } from '../../utils/claude'
import RecipeModal from './RecipeModal'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const MEALS = ['preBreakfast', 'breakfast', 'postBreakfast', 'lunch', 'evening', 'dinner']
const MEAL_LABELS = {
  preBreakfast: 'Pre-breakfast', breakfast: 'Breakfast',
  postBreakfast: 'Post-breakfast', lunch: 'Lunch',
  evening: 'Evening snack', dinner: 'Dinner'
}
const MEAL_TIMES = {
  preBreakfast: '6–7 am', breakfast: '8–9 am',
  postBreakfast: '11 am', lunch: '1 pm',
  evening: '5–6 pm', dinner: '8–9 pm'
}

function DayTotal({ meals }) {
  const total = Object.values(meals).reduce((sum, m) => sum + (m?.calories || 0), 0)
  return (
    <span className="text-xs text-slate-400 font-medium">{total} kcal total</span>
  )
}

function MealRow({ meal, data, onEdit }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
      <div className="flex-shrink-0 text-right w-[72px]">
        <div className="text-xs font-medium text-slate-400">{MEAL_LABELS[meal]}</div>
        <div className="text-[10px] text-slate-600">{MEAL_TIMES[meal]}</div>
      </div>
      <div className="flex-1 min-w-0">
        {data ? (
          <div>
            <div className="text-sm font-medium truncate">{data.dish}</div>
            <div className="flex gap-2 mt-0.5 text-[10px] text-slate-500">
              <span>{data.calories} kcal</span>
              <span>P {data.protein}g</span>
              <span>C {data.carbs}g</span>
              <span>F {data.fat}g</span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-600 italic">Not set</span>
        )}
      </div>
      <button onClick={onEdit} className="p-2 text-slate-500 hover:text-brand-400 flex-shrink-0">
        <Pencil size={14} />
      </button>
    </div>
  )
}

function DayCard({ day, plan, profile, onMealEdit }) {
  const [open, setOpen] = useState(false)
  const dayPlan = plan?.[day] || {}
  const total = Object.values(dayPlan).reduce((s, m) => s + (m?.calories || 0), 0)

  return (
    <div className="card">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between">
        <div>
          <span className="font-semibold capitalize">{day}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{total} kcal</span>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="mt-3">
          {MEALS.map(meal => (
            <MealRow
              key={meal}
              meal={meal}
              data={dayPlan[meal]}
              onEdit={() => onMealEdit(day, meal)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DietPlanTab({ profile }) {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editTarget, setEditTarget] = useState(null) // { day, meal }
  const [savedRecipes, setSavedRecipes] = useState([])
  const [showRecipeLib, setShowRecipeLib] = useState(false)

  useEffect(() => {
    if (!profile) return
    const stored = getDietPlan(profile.id)
    if (stored) setPlan(stored)
    setSavedRecipes(getSavedRecipes())
  }, [profile])

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const generated = await generateWeeklyPlan({
        profile,
        targets: profile.targets,
        preferences: profile.dietaryPrefs
      })
      setPlan(generated)
      saveDietPlan(profile.id, generated)
    } catch (e) {
      if (e.message === 'NO_API_KEY') {
        setError('Claude API key not set. Add it in Settings (gear icon).')
      } else {
        setError('Failed to generate plan. ' + e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMealEdit = (day, meal) => {
    setEditTarget({ day, meal })
  }

  const handleMealSelect = (item) => {
    const updated = {
      ...plan,
      [editTarget.day]: {
        ...(plan?.[editTarget.day] || {}),
        [editTarget.meal]: item
      }
    }
    setPlan(updated)
    saveDietPlan(profile.id, updated)
    setEditTarget(null)
  }

  const handleSavedRecipeSelect = (recipe) => {
    if (!editTarget) return
    handleMealSelect({
      dish: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      fiber: recipe.fiber || 0
    })
    setShowRecipeLib(false)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        Select a profile to view your diet plan
      </div>
    )
  }

  const mealCalTarget = Math.round((profile.targets?.calories || 2000) / 6)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Weekly Plan</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowRecipeLib(true)}
            className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-xl transition-colors">
            <BookOpen size={18} />
          </button>
          <button onClick={handleGenerate} disabled={loading}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white
                       text-sm font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : plan ? <RefreshCw size={14} /> : <Sparkles size={14} />
            }
            {plan ? 'Regenerate' : 'Generate plan'}
          </button>
        </div>
      </div>

      {/* Targets summary */}
      <div className="card flex gap-4 text-sm text-center overflow-x-auto">
        <div className="flex-shrink-0">
          <div className="text-slate-400 text-xs">Target</div>
          <div className="font-bold text-orange-400">{profile.targets?.calories} kcal</div>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="flex-shrink-0">
          <div className="text-slate-400 text-xs">Protein</div>
          <div className="font-semibold">{profile.targets?.protein}g</div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-slate-400 text-xs">Carbs</div>
          <div className="font-semibold">{profile.targets?.carbs}g</div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-slate-400 text-xs">Fat</div>
          <div className="font-semibold">{profile.targets?.fat}g</div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-800 rounded-xl text-red-300 text-sm">{error}</div>
      )}

      {!plan && !loading && (
        <div className="card text-center py-12 space-y-3">
          <div className="text-4xl">🥗</div>
          <p className="text-slate-400 text-sm">No weekly plan yet</p>
          <p className="text-slate-500 text-xs">Generate a personalised plan based on your calorie targets and preferences</p>
          <button onClick={handleGenerate} className="btn-primary max-w-xs mx-auto">
            <Sparkles size={16} className="inline mr-2" />Generate weekly plan
          </button>
        </div>
      )}

      {loading && (
        <div className="card text-center py-12 space-y-3">
          <Loader2 size={32} className="animate-spin text-brand-400 mx-auto" />
          <p className="text-slate-400 text-sm">Generating your personalised meal plan...</p>
          <p className="text-slate-500 text-xs">This takes about 15–20 seconds</p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-3">
          {DAYS.map(day => (
            <DayCard key={day} day={day} plan={plan} profile={profile} onMealEdit={handleMealEdit} />
          ))}
        </div>
      )}

      {/* Recipe modal */}
      {editTarget && !showRecipeLib && (
        <RecipeModal
          mealType={editTarget.meal}
          targetCalories={mealCalTarget}
          profile={profile}
          onSelect={handleMealSelect}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Saved recipe library */}
      {showRecipeLib && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur flex flex-col">
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between">
            <h3 className="font-bold">Saved Recipes</h3>
            <button onClick={() => { setShowRecipeLib(false); setEditTarget(null) }}
              className="p-2 text-slate-400 hover:text-slate-200">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedRecipes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No saved recipes yet. Generate and save recipes from the diet plan.
              </div>
            ) : (
              savedRecipes.map(r => (
                <div key={r.id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{r.description}</div>
                      <div className="flex gap-3 text-xs text-slate-500 mt-1">
                        <span>{r.calories} kcal</span>
                        <span>P {r.protein}g</span>
                        <span>C {r.carbs}g</span>
                      </div>
                    </div>
                  </div>
                  {editTarget && (
                    <button onClick={() => handleSavedRecipeSelect(r)}
                      className="mt-3 btn-secondary py-2 text-sm">
                      Use for {MEAL_LABELS[editTarget.meal]}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
