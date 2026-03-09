import { getSettings } from './storage'

const API_URL = 'https://api.anthropic.com/v1/messages'

export async function generateRecipes({ query, calories, preferences, mealType }) {
  const settings = getSettings()
  const apiKey = settings.claudeApiKey
  if (!apiKey) throw new Error('NO_API_KEY')

  const prefStr = preferences?.length ? `Dietary preferences: ${preferences.join(', ')}.` : ''
  const prompt = `Generate 3 healthy recipe options for someone who wants to eat "${query}" for ${mealType}.
${prefStr}
Target calories: approximately ${calories} kcal.

For each recipe return:
- Name
- Brief description (1 sentence)
- Ingredients list (brief)
- Calories (approx)
- Protein (g), Carbs (g), Fat (g), Fiber (g)

Format as JSON array:
[
  {
    "name": "...",
    "description": "...",
    "ingredients": ["...", "..."],
    "calories": 000,
    "protein": 00,
    "carbs": 00,
    "fat": 00,
    "fiber": 0
  }
]

Return ONLY the JSON array, no other text.`

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
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0].text.trim()
  return JSON.parse(text)
}

export async function generateWeeklyPlan({ profile, targets, preferences }) {
  const settings = getSettings()
  const apiKey = settings.claudeApiKey
  if (!apiKey) throw new Error('NO_API_KEY')

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const meals = ['preBreakfast', 'breakfast', 'postBreakfast', 'lunch', 'evening', 'dinner']
  const mealLabels = {
    preBreakfast: 'Pre-breakfast (light, ~6-7am)',
    breakfast: 'Breakfast (~8-9am)',
    postBreakfast: 'Post-breakfast snack (~11am)',
    lunch: 'Lunch (~1pm)',
    evening: 'Evening snack (~5-6pm)',
    dinner: 'Dinner (~8-9pm)'
  }

  const prefStr = preferences?.length ? `Dietary preferences: ${preferences.join(', ')}.` : ''
  const prompt = `Create a healthy 7-day meal plan for someone with these goals:
- Daily calorie target: ${targets.calories} kcal
- Protein: ${targets.protein}g, Carbs: ${targets.carbs}g, Fat: ${targets.fat}g
- Goal: ${profile.goal}
${prefStr}
- Health conditions: ${profile.healthConditions?.join(', ') || 'none'}

Create a variety of healthy Indian/international meals. Keep it practical and realistic.

Return a JSON object with this exact structure:
{
  "monday": {
    "preBreakfast": { "dish": "...", "calories": 00, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0 },
    "breakfast": { ... },
    "postBreakfast": { ... },
    "lunch": { ... },
    "evening": { ... },
    "dinner": { ... }
  },
  "tuesday": { ... },
  ... (all 7 days)
}

Return ONLY the JSON object, no other text.`

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
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0].text.trim()
  return JSON.parse(text)
}
