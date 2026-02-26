import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  FirestoreError,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MealPlan } from '../models/meal-plan.model';

@Injectable({
  providedIn: 'root',
})
export class MealPlanService {
  private firestore = inject(Firestore);
  private readonly collectionName = 'mealPlans';

  /**
   * Saves or updates a meal plan
   * @param mealPlan The meal plan data to save
   * @param id The existing ID to update, if any
   * @returns The document ID of the saved plan
   */
  async saveMealPlan(mealPlan: Omit<MealPlan, 'id'>, id?: string): Promise<string> {
    const plansCollection = collection(this.firestore, this.collectionName);

    if (id) {
      const docRef = doc(plansCollection, id);
      await updateDoc(docRef, mealPlan as any);
      return id;
    } else {
      const docRef = await addDoc(plansCollection, mealPlan);
      return docRef.id;
    }
  }

  /**
   * Gets a meal plan exactly matching the given start and end date.
   * Note: This listens to snapshot changes in real-time.
   */
  getMealPlan(startDate: string, endDate: string): Observable<MealPlan | undefined> {
    const plansCollection = collection(this.firestore, this.collectionName);
    const q = query(
      plansCollection,
      where('startDate', '==', startDate),
      where('endDate', '==', endDate),
    );

    return new Observable<MealPlan | undefined>((observer) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            observer.next({
              id: docSnap.id,
              ...(docSnap.data() as Omit<MealPlan, 'id'>),
            });
          } else {
            observer.next(undefined);
          }
        },
        (error: FirestoreError) => {
          console.error('Error fetching meal plan:', error);
          observer.error(error);
        },
      );

      return () => unsubscribe();
    });
  }
}
