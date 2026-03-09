// Gunjan's food preferences extracted from meal planning sheets
// Used to seed Claude prompts for diet plan generation

export const FOOD_PREFERENCES = {
  morning: [
    '5-6 almonds + chia seeds',
  ],

  preBreakfast: [
    '5-6 almonds + chia seeds',
    'Almonds + chia seeds + green tea',
    'Almonds + chia seeds + lemon water',
    'Almonds + chia seeds + herbal tea',
    'Almonds + chia seeds + black coffee',
  ],

  breakfast: [
    'Poha',
    'Dosa',
    'Idli',
    'Uttapam',
    'Avocado toast',
    'Mushroom toast',
    'Paneer kulcha',
    'Veg vermicelli',
    'Besan chila',
    'Paneer corn lettuce sandwich',
    'Corn cheese sandwich',
    'Sprouts with lemon',
    'Omelette',
    'French toast',
    'Pancake',
    'Veg maggi',
  ],

  lunch: [
    'Masoor dal + shahi paneer + roti + raita',
    'Dal makhani + mix veg + roti',
    'Rajmah + rice + mix veg',
    'Lobia + rice + bhindi',
    'Kaale channe + rice + kurkuri bhindi',
    'Arhar dal + bhindi + roti',
    'Palak dal + dry aloo + roti',
    'Chana dal + dry aloo + rice',
    'Matar paneer + roti + raita',
    'Soya chaap + masoor dal + roti + raita',
    'Mixed dal + soya chaap + roti + raita',
    'Chole + paneer bhurji + kulcha',
    'Shahi paneer + roti + raita',
    'Nutri matar + roti + raita',
    'Chicken biryani',
    'Dal makhani + aloo methi + roti',
    'Ghiya kofta + roti',
    'Mixed dal + kathal + roti',
  ],

  eveningSnack: [
    'Masala idli',
    'Chana chaat',
    'Sprouts chaat',
    'Quinoa salad',
    'Kaale channe tikki',
    'Boiled corn',
    'Fruit bowl',
    'Soya tikka',
    'Paneer sandwich',
    'Rajmah tikki',
    'Fruits',
  ],

  dinner: [
    'Grilled chicken with stuffed spinach + yoghurt dip + soup',
    'Chilli chicken + yoghurt dip + soup',
    'Grilled fish + fried rice',
    'Fish tikka + grilled veggies + yoghurt dip',
    'Seekh kebab + raita',
    'Chicken sandwich + quinoa salad',
    'Chicken galouti kebab + yoghurt dip + soup',
    'Kadai chicken + grilled veggies',
    'Kaale chana tikki + yoghurt dip + soup',
    'Besan chila',
    'Moong dal chila',
    'Dhokla + green chutney',
    'Veg kebab + raita',
    'Paneer tikka + salad',
    'Grilled chicken + broccoli + carrots + peas',
    'Masala chicken fry + salad',
    'Chilli fish + stir fried veggies',
    'Chicken keema tikki + yoghurt dip',
  ],

  // Weekend indulgences (Sat/Sun)
  weekend: [
    'Pao bhaji',
    'Pizza',
    'Chole bhature',
    'Chicken biryani',
    'Fish masala + rice',
    'Paneer bhurji + kulcha',
  ],
}

export function getFoodPreferencesPrompt() {
  return `
IMPORTANT: Build the meal plan primarily (80-90%) using dishes from this list of the user's preferred foods. You may add a few healthy alternatives of your own.

Morning ritual: ${FOOD_PREFERENCES.morning.join(', ')}

Pre-breakfast options: ${FOOD_PREFERENCES.preBreakfast.join(' | ')}

Breakfast options: ${FOOD_PREFERENCES.breakfast.join(' | ')}

Lunch options: ${FOOD_PREFERENCES.lunch.join(' | ')}

Evening snack options: ${FOOD_PREFERENCES.eveningSnack.join(' | ')}

Dinner options: ${FOOD_PREFERENCES.dinner.join(' | ')}

Weekend treats (Sat/Sun only): ${FOOD_PREFERENCES.weekend.join(' | ')}

Rules (STRICTLY follow these):
- Pre-breakfast is ALWAYS light: almonds, chia seeds, tea, lemon water only. NO eggs, NO cooked food.
- Tuesday and Thursday are FULLY VEGETARIAN — absolutely no chicken, fish, or any meat.
- Non-veg meals (chicken, fish) only on Monday, Wednesday, Friday, Saturday, Sunday — and only at dinner.
- Saturday and Sunday calorie targets are the SAME as weekdays — do not increase.
- Lunch is typically Indian dal/sabzi based with roti or rice.
- Evening snacks are light and healthy.
- Always start pre-breakfast with almonds + chia seeds.
`.trim()
}
