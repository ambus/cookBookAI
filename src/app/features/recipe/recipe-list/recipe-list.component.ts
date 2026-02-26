import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RecipeService } from '../../../core/services/recipe.service';

@Component({
  selector: 'app-recipe-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './recipe-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeListComponent {
  private recipeService = inject(RecipeService);

  readonly recipes$ = this.recipeService.getRecipes();
  readonly recipes = toSignal(this.recipes$, { initialValue: [] });
  readonly searchQuery = signal('');

  readonly filteredRecipes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allRecipes = this.recipes();

    if (!query) return allRecipes;

    return allRecipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query) ||
        (recipe.ingredients && recipe.ingredients.toLowerCase().includes(query)) ||
        recipe.category.toLowerCase().includes(query),
    );
  });

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

  getRatingDisplay(
    rating: string | undefined,
  ): { icon: string; text: string; color: string } | null {
    switch (rating) {
      case 'fatalne':
        return {
          icon: '❌',
          text: 'Fatalne',
          color: 'text-red-400 border-red-500/20 bg-red-500/10',
        };
      case 'średnie':
        return {
          icon: '➖',
          text: 'Średnie',
          color: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
        };
      case 'dobre':
        return {
          icon: '⭐',
          text: 'Dobre',
          color: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
        };
      case 'wyśmienite':
        return {
          icon: '⭐⭐',
          text: 'Wyśmienite',
          color: 'text-green-400 border-green-500/20 bg-green-500/10',
        };
      default:
        return null;
    }
  }

  async exportRecipes(): Promise<void> {
    try {
      const recipes = await firstValueFrom(this.recipes$);
      const exportData = recipes.map((r) => {
        const { id, ...rest } = r;
        return rest;
      });
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `przepisy-eksport-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Błąd podczas eksportu:', error);
      alert('Nie udało się wyeksportować przepisów.');
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string;
        const recipes = JSON.parse(result);

        if (!Array.isArray(recipes)) {
          throw new Error('Nieprawidłowy format pliku. Oczekiwano tablicy przepisów.');
        }

        await this.recipeService.importRecipes(recipes);
        alert(`Pomyślnie zaimportowano ${recipes.length} przepisów!`);
      } catch (error) {
        console.error('Błąd podczas importu:', error);
        alert(
          'Nie udało się zaimportować przepisów. Upewnij się, że plik to poprawny JSON wyeksportowany z aplikacji.',
        );
      }
      input.value = '';
    };

    reader.readAsText(file);
  }
}
