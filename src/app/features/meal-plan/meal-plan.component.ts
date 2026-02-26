import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MealPlan, PlannedMeal } from '../../core/models/meal-plan.model';
import { Recipe } from '../../core/models/recipe.model';
import { MealPlanService } from '../../core/services/meal-plan.service';
import { RecipeService } from '../../core/services/recipe.service';

@Component({
  selector: 'app-meal-plan',
  imports: [DatePipe, FormsModule],
  templateUrl: './meal-plan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlanComponent implements OnInit {
  private mealPlanService = inject(MealPlanService);
  private recipeService = inject(RecipeService);

  // --- State ---
  currentStartDate = signal<string>(this.getMonday(new Date()).toISOString().split('T')[0]);

  currentEndDate = computed(() => {
    const start = new Date(this.currentStartDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end.toISOString().split('T')[0];
  });

  weekDays = computed(() => {
    const start = new Date(this.currentStartDate());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  });

  recipes = signal<Recipe[]>([]);
  mealPlan = signal<MealPlan | undefined>(undefined);
  isLoadingPlan = signal<boolean>(false);

  // UI state array for easier template rendering
  // Array of 7 days, each with a PlannedMeal if exists
  plannedDays = computed(() => {
    const plan = this.mealPlan();
    return this.weekDays().map((dateStr) => {
      const meal = plan?.meals.find((m) => m.date === dateStr);
      return {
        dateStr,
        dateObj: new Date(dateStr),
        meal,
      };
    });
  });

  looseMeals = computed(() => {
    const plan = this.mealPlan();
    return plan?.meals.filter((m) => !m.date) || [];
  });

  // State for the editor form
  editingMeal = signal<{
    id?: string;
    dateStr?: string;
    searchTerm: string;
    selectedRecipeId: string | null;
  } | null>(null);

  isDropdownOpen = signal<boolean>(false);

  filteredRecipes = computed(() => {
    const editState = this.editingMeal();
    if (!editState) return [];

    const term = editState.searchTerm.toLowerCase();
    if (!term) return this.recipes();

    return this.recipes().filter((r) => r.title.toLowerCase().includes(term));
  });

  ngOnInit() {
    this.recipeService.getRecipes().subscribe((res) => {
      this.recipes.set(res);
    });
    this.loadPlan();
  }

  loadPlan() {
    this.isLoadingPlan.set(true);
    this.mealPlanService
      .getMealPlan(this.currentStartDate(), this.currentEndDate())
      .subscribe((plan) => {
        if (plan) {
          this.mealPlan.set(plan);
        } else {
          this.mealPlan.set({
            startDate: this.currentStartDate(),
            endDate: this.currentEndDate(),
            meals: [],
          });
        }
        this.isLoadingPlan.set(false);
      });
  }

  nextWeek() {
    const start = new Date(this.currentStartDate());
    start.setDate(start.getDate() + 7);
    this.currentStartDate.set(start.toISOString().split('T')[0]);
    this.loadPlan();
    this.cancelEditing();
  }

  prevWeek() {
    const start = new Date(this.currentStartDate());
    start.setDate(start.getDate() - 7);
    this.currentStartDate.set(start.toISOString().split('T')[0]);
    this.loadPlan();
    this.cancelEditing();
  }

  onStartDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.currentStartDate.set(input.value);
      this.loadPlan();
      this.cancelEditing();
    }
  }

  // --- Actions ---

  startEditing(dateStr?: string, existingMeal?: PlannedMeal) {
    if (existingMeal) {
      this.editingMeal.set({
        id: existingMeal.id,
        dateStr: existingMeal.date,
        searchTerm: existingMeal.recipeId
          ? this.getRecipeTitle(existingMeal.recipeId)
          : existingMeal.customText || '',
        selectedRecipeId: existingMeal.recipeId || null,
      });
    } else {
      this.editingMeal.set({
        id: undefined,
        dateStr,
        searchTerm: '',
        selectedRecipeId: null,
      });
    }
    this.isDropdownOpen.set(true);
  }

  cancelEditing() {
    this.editingMeal.set(null);
    this.isDropdownOpen.set(false);
  }

  selectRecipe(recipe: Recipe) {
    const editState = this.editingMeal();
    if (editState) {
      this.editingMeal.set({
        ...editState,
        searchTerm: recipe.title,
        selectedRecipeId: recipe.id || null,
      });
      this.isDropdownOpen.set(false);
    }
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const editState = this.editingMeal();
    if (editState) {
      this.editingMeal.set({
        ...editState,
        searchTerm: input.value,
        selectedRecipeId: null, // Clear selection if typing
      });
      this.isDropdownOpen.set(true);
    }
  }

  onSearchFocus() {
    this.isDropdownOpen.set(true);
  }

  onSearchBlur() {
    setTimeout(() => {
      this.isDropdownOpen.set(false);
    }, 200);
  }

  async saveMeal() {
    const editState = this.editingMeal();
    if (!editState) return;

    // Ensure at least recipeId or customText is provided
    if (!editState.selectedRecipeId && !editState.searchTerm.trim()) {
      return;
    }

    const plan = this.mealPlan();
    if (!plan) return;

    const newMeals = [...plan.meals];

    const mealData: any = {
      id: editState.id || crypto.randomUUID(),
    };

    if (editState.dateStr) mealData.date = editState.dateStr;
    if (editState.selectedRecipeId) {
      mealData.recipeId = editState.selectedRecipeId;
    } else if (editState.searchTerm.trim()) {
      mealData.customText = editState.searchTerm.trim();
    }

    if (editState.id) {
      // Editing existing
      const index = newMeals.findIndex((m) => m.id === editState.id);
      if (index >= 0) newMeals[index] = mealData;
    } else {
      // If it's for a specific date, and we only want 1 meal per date, we could check here.
      // But we will just add it, and if one existed, it could be replaced.
      // Let's enforce 1 meal per day in the grid by replacing if necessary.
      if (editState.dateStr) {
        const index = newMeals.findIndex((m) => m.date === editState.dateStr);
        if (index >= 0) {
          // Replace
          newMeals[index] = mealData;
        } else {
          newMeals.push(mealData);
        }
      } else {
        // Loose meal
        newMeals.push(mealData);
      }
    }

    const updatedPlan: MealPlan = {
      ...plan,
      meals: newMeals,
    };

    this.cancelEditing();
    this.mealPlan.set(updatedPlan); // Optimistic update

    // Save to Firestore (serialize/deserialize to strip any leftover undefined values)
    const planToSave = JSON.parse(JSON.stringify(updatedPlan));

    try {
      if (plan.id) {
        await this.mealPlanService.saveMealPlan(
          { startDate: planToSave.startDate, endDate: planToSave.endDate, meals: planToSave.meals },
          plan.id,
        );
      } else {
        const newId = await this.mealPlanService.saveMealPlan({
          startDate: planToSave.startDate,
          endDate: planToSave.endDate,
          meals: planToSave.meals,
        });
        // After save, update id
        this.mealPlan.set({ ...updatedPlan, id: newId });
      }
    } catch (err) {
      console.error('Error saving meal plan', err);
      // Reload from DB to revert on error
      this.loadPlan();
    }
  }

  async removeMeal(id: string) {
    const plan = this.mealPlan();
    if (!plan) return;

    const updatedPlan: MealPlan = {
      ...plan,
      meals: plan.meals.filter((m) => m.id !== id),
    };

    this.mealPlan.set(updatedPlan); // Optimistic update

    try {
      if (plan.id) {
        await this.mealPlanService.saveMealPlan(
          { startDate: plan.startDate, endDate: plan.endDate, meals: updatedPlan.meals },
          plan.id,
        );
      }
    } catch (err) {
      console.error('Error removing meal from plan', err);
      this.loadPlan();
    }
  }

  getRecipeTitle(recipeId?: string): string {
    if (!recipeId) return '';
    const r = this.recipes().find((r) => r.id === recipeId);
    return r ? r.title : 'Wybrany przepis';
  }

  // --- Helpers ---
  private getMonday(d: Date): Date {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
