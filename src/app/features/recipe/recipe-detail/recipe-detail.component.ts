import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { RecipeService } from '../../../core/services/recipe.service';

@Component({
  selector: 'app-recipe-detail',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './recipe-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailComponent {
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  readonly recipe$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => this.recipeService.getRecipe(id || '')),
  );

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Ciasta i słodycze': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'Dania główne': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Imprezy: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Inne: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      'Rice Cakes': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Sałatki: 'bg-green-500/10 text-green-400 border-green-500/20',
      'Śniadania i kolacje': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      Warzywa: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Zupy: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return colors[category] || colors['Inne'];
  }
}
