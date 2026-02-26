export interface PlannedMeal {
  id: string; // Unique ID for list rendering and manipulation (e.g. UUID or timestamp)
  date?: string; // ISO string (YYYY-MM-DD), undefined for loose meals
  recipeId?: string; // ID from Recipe collection
  customText?: string; // Free text if no recipe is selected
}

export interface MealPlan {
  id?: string; // Firestore document ID
  startDate: string; // ISO string (YYYY-MM-DD)
  endDate: string; // ISO string (YYYY-MM-DD)
  meals: PlannedMeal[];
}
