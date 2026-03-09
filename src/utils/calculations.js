// BMR using Mifflin-St Jeor equation
export function calcBMR(weight, height, age, gender) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // desk job, little/no exercise
  light: 1.375,        // light exercise 1-3 days/week
  moderate: 1.55,      // moderate exercise 3-5 days/week
  active: 1.725,       // hard exercise 6-7 days/week
  very_active: 1.9     // physical job + hard training
}

export function calcTDEE(bmr, activityLevel) {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2))
}

export function calcTargets(profile) {
  const bmr = calcBMR(profile.weight, profile.height, profile.age, profile.gender)
  const tdee = calcTDEE(bmr, profile.activityLevel)

  let calories
  switch (profile.goal) {
    case 'lose':
      calories = Math.round(tdee * 0.8)  // 20% deficit
      break
    case 'gain':
      calories = Math.round(tdee * 1.1)  // 10% surplus
      break
    case 'fitness':
      calories = Math.round(tdee * 1.05) // slight surplus
      break
    default:
      calories = tdee
  }

  // Macro split based on goal
  let proteinRatio, carbRatio, fatRatio
  if (profile.goal === 'lose') {
    proteinRatio = 0.35; carbRatio = 0.35; fatRatio = 0.30
  } else if (profile.goal === 'gain') {
    proteinRatio = 0.30; carbRatio = 0.45; fatRatio = 0.25
  } else {
    proteinRatio = 0.25; carbRatio = 0.45; fatRatio = 0.30
  }

  return {
    calories,
    protein: Math.round((calories * proteinRatio) / 4),   // 4 cal/g
    carbs: Math.round((calories * carbRatio) / 4),         // 4 cal/g
    fat: Math.round((calories * fatRatio) / 9),            // 9 cal/g
    fiber: 25,
    water: Math.round(profile.weight * 0.033)              // liters
  }
}

export function calcBMI(weight, height) {
  const heightM = height / 100
  return (weight / (heightM * heightM)).toFixed(1)
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' }
  if (bmi < 25) return { label: 'Normal', color: 'text-green-400' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' }
  return { label: 'Obese', color: 'text-red-400' }
}

export function sumMeals(meals) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  Object.values(meals).forEach(mealItems => {
    if (!Array.isArray(mealItems)) return
    mealItems.forEach(item => {
      totals.calories += item.calories || 0
      totals.protein += item.protein || 0
      totals.carbs += item.carbs || 0
      totals.fat += item.fat || 0
      totals.fiber += item.fiber || 0
    })
  })
  return totals
}
