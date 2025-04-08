// src/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private auth: AngularFireAuth,
    private router: Router
  ) {
    // Auto-redirect to job dashboard if user is already authenticated
    this.isAuthenticated().subscribe(authenticated => {
      if (authenticated && this.router.url === '/home') {
        this.router.navigate(['/job-dashboard']);
      }
    });
  }

  login(): Promise<void> {
    return this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(() => {
        // Navigate to job dashboard after successful login
        this.router.navigate(['/job-dashboard']);
      })
      .catch(error => {
        console.error('Login error:', error);
        throw error;
      });
  }

  logout(): Promise<void> {
    return this.auth.signOut()
      .then(() => {
        // Navigate to home page after logout
        this.router.navigate(['/home']);
      })
      .catch(error => {
        console.error('Logout error:', error);
        throw error;
      });
  }

  isAuthenticated(): Observable<boolean> {
    return this.auth.authState.pipe(
      map(user => !!user)
    );
  }

  getCurrentUser(): Observable<firebase.User | null> {
    return this.auth.authState;
  }
}
