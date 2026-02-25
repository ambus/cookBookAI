import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  DocumentSnapshot,
  Firestore,
  FirestoreError,
  onSnapshot,
  orderBy,
  query,
} from '@angular/fire/firestore';
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
          const recipes = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Recipe, 'id'>),
          }));
          observer.next(recipes);
        },
        (error: FirestoreError) => {
          console.error('Error fetching recipes:', error);
          observer.error(error);
        },
      );

      return () => unsubscribe();
    });
  }

  getRecipe(id: string): Observable<Recipe | undefined> {
    const recipesCollection = collection(this.firestore, this.collectionName);
    const recipeDoc = doc(recipesCollection, id);

    return new Observable<Recipe | undefined>((observer) => {
      const unsubscribe = onSnapshot(
        recipeDoc,
        (snapshot: DocumentSnapshot) => {
          if (snapshot.exists()) {
            observer.next({
              id: snapshot.id,
              ...(snapshot.data() as Omit<Recipe, 'id'>),
            });
          } else {
            observer.next(undefined);
          }
        },
        (error: FirestoreError) => {
          console.error('Error fetching recipe:', error);
          observer.error(error);
        },
      );

      return () => unsubscribe();
    });
  }
}
