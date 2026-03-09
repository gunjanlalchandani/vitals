import { useState } from 'react'
import { X, Loader2, ChefHat, PenLine, Check, BookmarkPlus, BookOpen, Search } from 'lucide-react'
import { generateRecipes } from '../../utils/claude'
import { saveRecipe, getSavedRecipes, generateId, getSettings } from '../../utils/storage'

const MEAL_LABELS = {
  preBreakfast: 'Pre-breakfast', breakfast: 'Breakfast',
  postBreakfast: 'Post-breakfast', lunch: 'Lunch',
  evening: 'Evening snack', dinner: 'Dinner'
}

export default function MealEditModal({ mealType, targetCalories, profile, onSelect, onClose }) {
  const [mode, setMode] = useState(null) // null | 'generate' | 'write' | 'library'
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [custom, setCustom] = useState({ dish: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' })
  const [savedRecipes, setSavedRecipes] = useState([])

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
      setError(e.message === 'NO_API_KEY'
        ? 'Claude API key not set — add it in Settings.'
        : 'Failed to generate. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRecipe = (recipe, saveToLib = false) => {
    if (saveToLib) {
      saveRecipe({
        id: generateId(),
        name: recipe.name,
        description: recipe.description || '',
        ingredients: recipe.ingredients || [],
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        fiber: recipe.fiber || 0,
        mealType,
        createdAt: new Date().toISOString(),
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

  const openLibrary = () => {
    setSavedRecipes(getSavedRecipes())
    setMode('library')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 border-b border-white/[0.08] px-4 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-black text-white">Edit meal</h3>
          <p className="text-xs text-slate-500">{MEAL_LABELS[mealType]} · ~{targetCalories} kcal</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Mode picker */}
        {!mode && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-slate-400 text-center mb-4">How would you like to change this meal?</p>

            <button onClick={() => setMode('generate')}
              disabled={!hasApiKey}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                hasApiKey
                  ? 'border-white/[0.08] bg-white/[0.03] hover:border-emerald-500/50 hover:bg-emerald-500/5'
                  : 'border-white/[0.05] bg-white/[0.02] opacity-50'
              }`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <ChefHat size={22} className="text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Generate a recipe</div>
                <div className="text-xs text-slate-400 mt-0.5">Tell me what you want — I'll suggest 3 options</div>
                {!hasApiKey && <div className="text-xs text-yellow-400 mt-0.5">Requires Claude API key</div>}
              </div>
            </button>

            <button onClick={() => setMode('write')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <PenLine size={22} className="text-blue-400" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Write my own dish</div>
                <div className="text-xs text-slate-400 mt-0.5">Enter dish name and nutrition manually</div>
              </div>
            </button>

            <button onClick={openLibrary}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-violet-500/50 hover:bg-violet-500/5 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen size={22} className="text-violet-400" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Pick from saved recipes</div>
                <div className="text-xs text-slate-400 mt-0.5">Your personal recipe library</div>
              </div>
            </button>
          </div>
        )}

        {/* Generate mode */}
        {mode === 'generate' && (
          <div className="space-y-4">
            <button onClick={() => { setMode(null); setRecipes([]); setError('') }}
              className="text-slate-500 hover:text-slate-300 text-sm">← Back</button>
            <div>
              <label className="label">What would you like to eat?</label>
              <div className="relative">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder="e.g. something light with paneer..."
                  className="pr-12"
                  autoFocus
                />
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading || !query.trim()} className="btn-primary">
              {loading ? <><Loader2 size={15} className="animate-spin inline mr-2" />Generating...</> : 'Suggest 3 recipes'}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {recipes.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pick one:</div>
                {recipes.map((r, i) => (
                  <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white">{r.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{r.description}</div>
                      </div>
                      <span className="text-xs text-orange-400 font-bold whitespace-nowrap">{r.calories} kcal</span>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span>P {r.protein}g</span><span>C {r.carbs}g</span><span>F {r.fat}g</span>
                    </div>
                    {r.ingredients?.length > 0 && (
                      <div className="text-xs text-slate-600">{r.ingredients.slice(0, 5).join(', ')}{r.ingredients.length > 5 ? '...' : ''}</div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => handleSelectRecipe(r, false)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/25 transition-colors">
                        <Check size={13} className="inline mr-1" />Use
                      </button>
                      <button onClick={() => handleSelectRecipe(r, true)}
                        className="flex-1 py-2 rounded-xl bg-white/[0.05] border border-white/[0.10] text-slate-300 text-sm font-semibold hover:bg-white/[0.08] transition-colors">
                        <BookmarkPlus size={13} className="inline mr-1" />Use + Save
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
            <button onClick={() => setMode(null)} className="text-slate-500 hover:text-slate-300 text-sm">← Back</button>
            <div>
              <label className="label">Dish name</label>
              <input value={custom.dish} onChange={e => setCustom(c => ({ ...c, dish: e.target.value }))} placeholder="e.g. Poha" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Calories</label><input type="number" value={custom.calories} onChange={e => setCustom(c => ({ ...c, calories: e.target.value }))} placeholder="250" /></div>
              <div><label className="label">Protein (g)</label><input type="number" value={custom.protein} onChange={e => setCustom(c => ({ ...c, protein: e.target.value }))} placeholder="8" /></div>
              <div><label className="label">Carbs (g)</label><input type="number" value={custom.carbs} onChange={e => setCustom(c => ({ ...c, carbs: e.target.value }))} placeholder="40" /></div>
              <div><label className="label">Fat (g)</label><input type="number" value={custom.fat} onChange={e => setCustom(c => ({ ...c, fat: e.target.value }))} placeholder="6" /></div>
            </div>
            <button onClick={handleCustomSave} disabled={!custom.dish.trim()} className="btn-primary">
              Add to meal
            </button>
          </div>
        )}

        {/* Library mode */}
        {mode === 'library' && (
          <div className="space-y-4">
            <button onClick={() => setMode(null)} className="text-slate-500 hover:text-slate-300 text-sm">← Back</button>
            {savedRecipes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No saved recipes yet. Generate and save recipes to build your library.
              </div>
            ) : (
              savedRecipes.map(r => (
                <div key={r.id} className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-bold text-white">{r.name}</div>
                      {r.description && <div className="text-xs text-slate-400 mt-0.5">{r.description}</div>}
                    </div>
                    <span className="text-xs text-orange-400 font-bold">{r.calories} kcal</span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500 mb-3">
                    <span>P {r.protein}g</span><span>C {r.carbs}g</span><span>F {r.fat}g</span>
                  </div>
                  <button onClick={() => onSelect({ dish: r.name, calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat, fiber: r.fiber || 0 })}
                    className="w-full py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/25 transition-colors">
                    Use this
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
