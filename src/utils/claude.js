import { getSettings } from './storage'
import { getFoodPreferencesPrompt } from './foodPreferences'

const API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(prompt, maxTokens = 2048) {
  const settings = getSettings()
  const apiKey = settings.claudeApiKey
  if (!apiKey) throw new Error('NO_API_KEY')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const raw = data.content[0].text.trim()

  // Extract JSON by finding the outermost { } or [ ] block
  const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (!match) throw new Error('No JSON found in response')
  return JSON.parse(match[0])
}

// Generate 3 recipe options for a specific meal edit
export async function generateRecipes({ query, calories, preferences, mealType }) {
  const prefStr = preferences?.length ? `Dietary preferences: ${preferences.join(', ')}.` : ''
  const prompt = `Generate 3 healthy recipe options for someone who wants "${query}" for ${mealType}.
${prefStr}
Target calories: ~${calories} kcal.

Return ONLY a JSON array:
[
  {
    "name": "...",
    "description": "one sentence",
    "ingredients": ["...", "..."],
    "calories": 000,
    "protein": 00,
    "carbs": 00,
    "fat": 00,
    "fiber": 0
  }
]`

  return callClaude(prompt, 1024)
}

function buildDayPlanPrompt({ days, profile, targets, preferences }) {
  const foodPrefs = getFoodPreferencesPrompt()
  const prefStr = preferences?.length ? `Dietary preferences: ${preferences.join(', ')}.` : ''

  return `Create a meal plan for these days: ${days.join(', ')}. TWO options per meal slot.

Profile:
- Daily calorie target: ${targets.calories} kcal
- Protein: ${targets.protein}g, Carbs: ${targets.carbs}g, Fat: ${targets.fat}g
- Goal: ${profile.goal}
${prefStr}
- Health conditions: ${profile.healthConditions?.join(', ') || 'none'}

${foodPrefs}

Return a JSON object with ONLY these days: ${days.join(', ')}.
Each day has 6 meals: preBreakfast, breakfast, postBreakfast, lunch, evening, dinner.
Each meal has this structure:
{ "optionA": { "dish": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0 }, "optionB": { "dish": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0 }, "selected": "A" }

Return ONLY the JSON object, no other text.`
}

// Generate full weekly plan — split into 2 requests to avoid token limits
export async function generateWeeklyPlan({ profile, targets, preferences }) {
  const [firstHalf, secondHalf] = await Promise.all([
    callClaude(buildDayPlanPrompt({ days: ['monday', 'tuesday', 'wednesday', 'thursday'], profile, targets, preferences }), 8000),
    callClaude(buildDayPlanPrompt({ days: ['friday', 'saturday', 'sunday'], profile, targets, preferences }), 6000),
  ])

  return { ...firstHalf, ...secondHalf }
}

// Search for a recipe matching user's query, biased toward their preferences
export async function searchRecipe({ query, mealType, calories, preferences }) {
  const foodPrefs = getFoodPreferencesPrompt()
  const prefStr = preferences?.length ? `Dietary preferences: ${preferences.join(', ')}.` : ''

  const prompt = `The user wants to eat "${query}" for ${mealType}. Suggest 3 recipe variations.
${prefStr}
Target calories: ~${calories} kcal per serving.

${foodPrefs}

Return ONLY a JSON array:
[
  {
    "name": "...",
    "description": "one sentence",
    "ingredients": ["...", "..."],
    "calories": 000,
    "protein": 00,
    "carbs": 00,
    "fat": 00,
    "fiber": 0
  }
]`

  return callClaude(prompt, 1024)
}
