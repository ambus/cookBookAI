import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RecipeCategory } from '../../../core/models/recipe.model';
import { RecipeService } from '../../../core/services/recipe.service';

@Component({
  selector: 'app-add-recipe',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-recipe.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRecipeComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private recipeService = inject(RecipeService);

  readonly categories: RecipeCategory[] = [
    'Ciasta i słodycze',
    'Dania główne',
    'Imprezy',
    'Inne',
    'Rice Cakes',
    'Sałatki',
    'Śniadania i kolacje',
    'Warzywa',
    'Zupy',
  ];

  recipeForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: ['Dania główne' as RecipeCategory, [Validators.required]],
    sourceUrl: [''],
    ingredients: ['', [Validators.required]],
    instructions: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.recipeForm.valid) {
      try {
        const recipeData = this.recipeForm.getRawValue();
        await this.recipeService.addRecipe(recipeData);
        this.router.navigate(['/recipes']);
      } catch (error) {
        console.error('Błąd podczas zapisywania przepisu:', error);
        // Ewentualnie wyświetlić jakiś komunikat o błędzie użytkownikowi
      }
    } else {
      this.recipeForm.markAllAsTouched();
    }
  }
}
