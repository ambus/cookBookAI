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
        path: 'add-recipe',
        loadComponent: () =>
          import('./features/recipe/add-recipe/add-recipe.component').then(
            (m) => m.AddRecipeComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
