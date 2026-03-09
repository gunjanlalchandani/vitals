import { useState } from 'react'
import { X, Loader2, ChefHat, PenLine, Check, BookmarkPlus } from 'lucide-react'
import { generateRecipes } from '../../utils/claude'
import { saveRecipe, generateId, getSettings } from '../../utils/storage'

const MEAL_LABELS = {
  preBreakfast: 'Pre-breakfast', breakfast: 'Breakfast',
  postBreakfast: 'Post-breakfast', lunch: 'Lunch',
  evening: 'Evening snack', dinner: 'Dinner'
}

export default function RecipeModal({ mealType, targetCalories, profile, onSelect, onClose }) {
  const [mode, setMode] = useState(null) // null | 'generate' | 'write'
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  // Write your own
  const [custom, setCustom] = useState({ dish: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' })

  const settings = getSettings()
  const hasApiKey = !!settings.claudeApiKey

  const handleGenerate = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const results = await generateRecipes({
        query,
        calories: targetCalories,
        preferences: profile?.dietaryPrefs,
        mealType: MEAL_LABELS[mealType]
      })
      setRecipes(results)
    } catch (e) {
      if (e.message === 'NO_API_KEY') {
        setError('Claude API key not set. Go to Settings to add it.')
      } else {
        setError('Failed to generate recipes. Check your API key and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRecipe = (recipe, addToLib) => {
    if (addToLib) {
      saveRecipe({
        id: generateId(),
        ...recipe,
        mealType,
        createdAt: new Date().toISOString(),
        inRegularPlan: false
      })
    }
    onSelect({ dish: recipe.name, calories: recipe.calories, protein: recipe.protein, carbs: recipe.carbs, fat: recipe.fat, fiber: recipe.fiber || 0 })
  }

  const handleCustomSave = () => {
    if (!custom.dish.trim()) return
    onSelect({
      dish: custom.dish.trim(),
      calories: +custom.calories || 0,
      protein: +custom.protein || 0,
      carbs: +custom.carbs || 0,
      fat: +custom.fat || 0,
      fiber: +custom.fiber || 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold">Change meal</h3>
          <p className="text-xs text-slate-400">{MEAL_LABELS[mealType]} · ~{targetCalories} kcal target</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Mode picker */}
        {!mode && (
          <div className="space-y-3 pt-4">
            <p className="text-sm text-slate-400 text-center">What would you like to do?</p>
            <button onClick={() => { setMode('generate'); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                hasApiKey
                  ? 'border-slate-700 bg-slate-800 hover:border-brand-500'
                  : 'border-slate-700 bg-slate-800/40 opacity-60'
              }`}
              disabled={!hasApiKey}
            >
              <ChefHat size={28} className="text-brand-400 flex-shrink-0" />
              <div className="text-left">
                <div className="font-semibold">Generate a new recipe</div>
                <div className="text-xs text-slate-400">Tell me what you want and I'll suggest 3 options</div>
                {!hasApiKey && <div className="text-xs text-yellow-400 mt-0.5">Requires Claude API key in Settings</div>}
              </div>
            </button>
            <button onClick={() => setMode('write')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-700 bg-slate-800 hover:border-brand-500 transition-all">
              <PenLine size={28} className="text-blue-400 flex-shrink-0" />
              <div className="text-left">
                <div className="font-semibold">Write my own dish</div>
                <div className="text-xs text-slate-400">Enter dish name and nutrition manually</div>
              </div>
            </button>
          </div>
        )}

        {/* Generate mode */}
        {mode === 'generate' && (
          <div className="space-y-4">
            <button onClick={() => { setMode(null); setRecipes([]); setError('') }}
              className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1">
              ← Back
            </button>
            <div>
              <label className="label">What would you like to eat?</label>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. something light with paneer..."
                autoFocus
              />
            </div>
            <button onClick={handleGenerate} disabled={loading || !query.trim()} className="btn-primary">
              {loading ? <><Loader2 size={16} className="animate-spin inline mr-2" />Generating...</> : 'Suggest 3 recipes'}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {recipes.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-slate-300">Pick one:</div>
                {recipes.map((r, i) => (
                  <div key={i} className="card space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{r.description}</div>
                      </div>
                      <span className="text-xs text-orange-400 font-semibold whitespace-nowrap">{r.calories} kcal</span>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>P {r.protein}g</span>
                      <span>C {r.carbs}g</span>
                      <span>F {r.fat}g</span>
                    </div>
                    {r.ingredients && (
                      <div className="text-xs text-slate-500">
                        {r.ingredients.slice(0, 4).join(', ')}{r.ingredients.length > 4 ? '...' : ''}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleSelectRecipe(r, false)}
                        className="flex-1 bg-brand-500/20 border border-brand-500/50 text-brand-300
                                   text-sm font-medium py-2 rounded-xl hover:bg-brand-500/30 transition-colors">
                        <Check size={14} className="inline mr-1" />Use this
                      </button>
                      <button onClick={() => handleSelectRecipe(r, true)}
                        className="flex-1 bg-slate-700 text-slate-200 text-sm font-medium py-2 rounded-xl
                                   hover:bg-slate-600 transition-colors">
                        <BookmarkPlus size={14} className="inline mr-1" />Use + Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Write own mode */}
        {mode === 'write' && (
          <div className="space-y-4">
            <button onClick={() => setMode(null)} className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1">
              ← Back
            </button>
            <div>
              <label className="label">Dish name</label>
              <input value={custom.dish} onChange={e => setCustom(c => ({ ...c, dish: e.target.value }))} placeholder="e.g. Poha" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Calories (kcal)</label>
                <input type="number" value={custom.calories} onChange={e => setCustom(c => ({ ...c, calories: e.target.value }))} placeholder="250" />
              </div>
              <div>
                <label className="label">Protein (g)</label>
                <input type="number" value={custom.protein} onChange={e => setCustom(c => ({ ...c, protein: e.target.value }))} placeholder="8" />
              </div>
              <div>
                <label className="label">Carbs (g)</label>
                <input type="number" value={custom.carbs} onChange={e => setCustom(c => ({ ...c, carbs: e.target.value }))} placeholder="40" />
              </div>
              <div>
                <label className="label">Fat (g)</label>
                <input type="number" value={custom.fat} onChange={e => setCustom(c => ({ ...c, fat: e.target.value }))} placeholder="6" />
              </div>
            </div>
            <button onClick={handleCustomSave} disabled={!custom.dish.trim()} className="btn-primary">
              Add to meal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
