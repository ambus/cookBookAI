import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'recipes',
        loadComponent: () =>
          import('./features/recipe/recipe-list/recipe-list.component').then(
            (m) => m.RecipeListComponent,
          ),
      },
      {
        path: 'recipe/:id',
        loadComponent: () =>
          import('./features/recipe/recipe-detail/recipe-detail.component').then(
            (m) => m.RecipeDetailComponent,
          ),
      },
      {
        path: 'add-recipe',
        loadComponent: () =>
          import('./features/recipe/add-recipe/add-recipe.component').then(
            (m) => m.AddRecipeComponent,
          ),
      },
      {
        path: 'edit-recipe/:id',
        loadComponent: () =>
          import('./features/recipe/add-recipe/add-recipe.component').then(
            (m) => m.AddRecipeComponent,
          ),
      },
      {
        path: 'meal-plan',
        loadComponent: () =>
          import('./features/meal-plan/meal-plan.component').then((m) => m.MealPlanComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
