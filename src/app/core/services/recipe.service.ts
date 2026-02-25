import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, onSnapshot, orderBy, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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

  getRecipes(): Observable<Recipe[]> {
    const recipesCollection = collection(this.firestore, this.collectionName);
    const recipesQuery = query(recipesCollection, orderBy('createdAt', 'desc'));

    return new Observable<Recipe[]>((observer) => {
      const unsubscribe = onSnapshot(
        recipesQuery,
        (snapshot) => {
          const recipes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Recipe, 'id'>),
          }));
          observer.next(recipes);
        },
        (error) => {
          console.error('Error fetching recipes:', error);
          observer.error(error);
        },
      );

      return () => unsubscribe();
    });
  }
}
