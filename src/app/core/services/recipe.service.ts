import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private firestore = inject(Firestore);
  private readonly collectionName = 'recipes';

  async addRecipe(recipe: Recipe): Promise<string> {
    const recipesCollection = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(recipesCollection, {
      ...recipe,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  }
}
