import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const firestore = inject(Firestore);
  const authService = inject(AuthService);

  return authState(auth).pipe(
    switchMap((user) => {
      // 1. If not logged in at all, redirect to login
      if (!user) {
        return of(router.createUrlTree(['/login']));
      }

      // 2. User is logged in via Google - check if UID exists in allowedUsers collection
      if (user.uid) {
        const userDocRef = doc(firestore, `allowedUsers/${user.uid}`);
        return from(getDoc(userDocRef)).pipe(
          map((snapshot) => {
            // Data will be defined if the document exists
            if (snapshot.exists()) {
              return true; // Authorized!
            }

            // Unauthorized - Log them out and redirect
            console.warn(`Unauthorized access attempt by: ${user.uid} (${user.email})`);
            authService.errorMessage.set(
              `User ${user.email} is not authorized to access this app.`,
            );
            authService.logout();
            return router.createUrlTree(['/login']);
          }),
          // In case of permission denied or other Firestore errors
          catchError((err) => {
            console.error('Error fetching user authorization document:', err);
            authService.logout();
            return of(router.createUrlTree(['/login']));
          }),
        );
      }

      // Edge case: user has no UID
      authService.logout();
      return of(router.createUrlTree(['/login']));
    }),
  );
};

export const publicGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    map((user) => {
      if (user) {
        return router.createUrlTree(['/']);
      }
      return true;
    }),
  );
};
