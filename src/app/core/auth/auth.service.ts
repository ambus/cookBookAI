import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(null);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    authState(this.auth).subscribe((user) => {
      this.user.set(user);
    });
  }

  async loginWithGoogle() {
    this.errorMessage.set(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Login failed', error);
      this.errorMessage.set('Google sign-in failed. Please try again.');
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}
