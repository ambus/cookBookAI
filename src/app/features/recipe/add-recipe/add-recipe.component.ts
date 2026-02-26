import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { first } from 'rxjs';
import { Recipe, RecipeCategory, RecipeRating } from '../../../core/models/recipe.model';
import { RecipeService } from '../../../core/services/recipe.service';

@Component({
  selector: 'app-add-recipe',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-recipe.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRecipeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  isEditMode = signal(false);
  recipeId = signal<string | null>(null);

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
    rating: ['' as RecipeRating | ''],
    sourceUrl: [''],
    ingredients: ['', [Validators.required]],
    instructions: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.recipeId.set(id);
      this.recipeService
        .getRecipe(id)
        .pipe(first())
        .subscribe((recipe: Recipe | undefined) => {
          if (recipe) {
            this.recipeForm.patchValue({
              title: recipe.title,
              category: recipe.category,
              rating: recipe.rating || '',
              sourceUrl: recipe.sourceUrl || '',
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
            });
          }
        });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.recipeForm.valid) {
      try {
        const rawData = this.recipeForm.getRawValue();
        const recipeData: Partial<Recipe> = {
          ...rawData,
          rating: rawData.rating === '' ? undefined : (rawData.rating as RecipeRating),
        };

        if (this.isEditMode() && this.recipeId()) {
          await this.recipeService.updateRecipe(this.recipeId()!, recipeData);
          this.router.navigate(['/recipe', this.recipeId()]);
        } else {
          await this.recipeService.addRecipe(recipeData as Recipe);
          this.router.navigate(['/recipes']);
        }
      } catch (error) {
        console.error('Błąd podczas zapisywania przepisu:', error);
      }
    } else {
      this.recipeForm.markAllAsTouched();
    }
  }
}
