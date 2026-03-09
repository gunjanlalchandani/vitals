const KEYS = {
  PROFILES: 'vitals_profiles',
  ACTIVE_PROFILE: 'vitals_active_profile',
  DIET_PLANS: 'vitals_diet_plans',
  DAILY_LOGS: 'vitals_daily_logs',
  METRICS: 'vitals_metrics',
  SAVED_RECIPES: 'vitals_saved_recipes',
  SETTINGS: 'vitals_settings',
}

function get(key) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : null
  } catch { return null }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Profiles ---
export function getProfiles() { return get(KEYS.PROFILES) || [] }
export function saveProfile(profile) {
  const profiles = getProfiles()
  const idx = profiles.findIndex(p => p.id === profile.id)
  if (idx >= 0) profiles[idx] = profile
  else profiles.push(profile)
  set(KEYS.PROFILES, profiles)
}
export function deleteProfile(id) {
  set(KEYS.PROFILES, getProfiles().filter(p => p.id !== id))
}
export function getActiveProfileId() { return get(KEYS.ACTIVE_PROFILE) }
export function setActiveProfileId(id) { set(KEYS.ACTIVE_PROFILE, id) }

// --- Diet Plans ---
export function getDietPlan(profileId) {
  const plans = get(KEYS.DIET_PLANS) || {}
  return plans[profileId] || null
}
export function saveDietPlan(profileId, plan) {
  const plans = get(KEYS.DIET_PLANS) || {}
  plans[profileId] = plan
  set(KEYS.DIET_PLANS, plans)
}

// --- Daily Logs ---
export function getDailyLog(profileId, date) {
  const logs = get(KEYS.DAILY_LOGS) || {}
  return logs[`${profileId}_${date}`] || { meals: {}, water: 0 }
}
export function saveDailyLog(profileId, date, log) {
  const logs = get(KEYS.DAILY_LOGS) || {}
  logs[`${profileId}_${date}`] = log
  set(KEYS.DAILY_LOGS, logs)
}
export function getAllLogsForProfile(profileId) {
  const logs = get(KEYS.DAILY_LOGS) || {}
  return Object.entries(logs)
    .filter(([key]) => key.startsWith(profileId + '_'))
    .map(([key, val]) => ({ date: key.replace(profileId + '_', ''), ...val }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// --- Metrics ---
export function getMetrics(profileId) {
  const all = get(KEYS.METRICS) || {}
  return all[profileId] || []
}
export function saveMetricEntry(profileId, entry) {
  const all = get(KEYS.METRICS) || {}
  if (!all[profileId]) all[profileId] = []
  const idx = all[profileId].findIndex(e => e.date === entry.date)
  if (idx >= 0) all[profileId][idx] = entry
  else all[profileId].push(entry)
  all[profileId].sort((a, b) => a.date.localeCompare(b.date))
  set(KEYS.METRICS, all)
}

// --- Saved Recipes ---
export function getSavedRecipes() { return get(KEYS.SAVED_RECIPES) || [] }
export function saveRecipe(recipe) {
  const recipes = getSavedRecipes()
  const idx = recipes.findIndex(r => r.id === recipe.id)
  if (idx >= 0) recipes[idx] = recipe
  else recipes.push(recipe)
  set(KEYS.SAVED_RECIPES, recipes)
}
export function deleteRecipe(id) {
  set(KEYS.SAVED_RECIPES, getSavedRecipes().filter(r => r.id !== id))
}

// --- Settings ---
export function getSettings() { return get(KEYS.SETTINGS) || {} }
export function saveSettings(settings) { set(KEYS.SETTINGS, { ...getSettings(), ...settings }) }

// --- Helpers ---
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function getDayName(date) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
}
