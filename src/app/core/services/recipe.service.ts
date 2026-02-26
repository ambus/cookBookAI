import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
  Firestore,
  FirestoreError,
  onSnapshot,
  query,
  updateDoc,
  writeBatch,
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

  async importRecipes(recipes: Omit<Recipe, 'id'>[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    const recipesCollection = collection(this.firestore, this.collectionName);

    for (const recipe of recipes) {
      const docRef = doc(recipesCollection);
      batch.set(docRef, {
        ...recipe,
        createdAt: recipe.createdAt || new Date().toISOString(),
      });
    }

    await batch.commit();
  }

  getRecipes(): Observable<Recipe[]> {
    const recipesCollection = collection(this.firestore, this.collectionName);
    const recipesQuery = query(recipesCollection);

    return new Observable<Recipe[]>((observer) => {
      const unsubscribe = onSnapshot(
        recipesQuery,
        (snapshot) => {
          const recipes = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Recipe, 'id'>),
          }));

          // Sort client-side to ensure recipes without createdAt are still included
          recipes.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });

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

  async updateRecipe(id: string, recipeData: Partial<Recipe>): Promise<void> {
    const recipesCollection = collection(this.firestore, this.collectionName);
    const recipeDoc = doc(recipesCollection, id);
    await updateDoc(recipeDoc, recipeData);
  }

  async deleteRecipe(id: string): Promise<void> {
    const recipesCollection = collection(this.firestore, this.collectionName);
    const recipeDoc = doc(recipesCollection, id);
    await deleteDoc(recipeDoc);
  }
}
