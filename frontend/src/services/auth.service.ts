import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();
  private apiUrl = environment.apiUrl;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient
  ) {
    // Set up auth state change listener
    this.afAuth.authState.subscribe(firebaseUser => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        };
        this.user.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        this.user.next(null);
        localStorage.removeItem('user');
      }
    });

    // Check for cached user on initialization
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user.next(JSON.parse(storedUser));
    }
  }

  // Firebase authentication methods
  async loginWithEmailPassword(email: string, password: string): Promise<any> {
    try {
      // First try Firebase direct auth
      const credential = await this.afAuth.signInWithEmailAndPassword(email, password);

      // Get the Firebase token
      const token = await credential.user?.getIdToken();

      // Then call your backend to set the cookie
      if (token) {
        return this.http.post(`${this.apiUrl}/login`, { token }).pipe(
          tap(() => this.router.navigate(['/dashboard'])),
          catchError(err => {
            console.error('Backend login error:', err);
            return of(credential);
          })
        ).toPromise();
      }

      // If we reach here, we have a firebase user but no backend call was made
      this.router.navigate(['/dashboard']);
      return credential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async registerWithEmailPassword(email: string, password: string, displayName?: string): Promise<any> {
    try {
      // Create the user in Firebase
      const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);

      // Update profile if displayName is provided
      if (displayName && credential.user) {
        await credential.user.updateProfile({ displayName });
      }

      // Send email verification
      if (credential.user) {
        await credential.user.sendEmailVerification();
      }

      // Call backend to create user in your database
      const token = await credential.user?.getIdToken();
      if (token) {
        return this.http.post(`${this.apiUrl}/register`, {
          token,
          displayName,
          email
        }).pipe(
          tap(() => this.router.navigate(['/verify-email'])),
          catchError(err => {
            console.error('Backend registration error:', err);
            return of(credential);
          })
        ).toPromise();
      }

      this.router.navigate(['/verify-email']);
      return credential;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  loginWithGoogle(): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.signInWithPopup(provider)
      .then(async (result) => {
        // Get token and call backend
        const token = await result.user?.getIdToken();
        if (token) {
          await this.http.post(`${this.apiUrl}/login`, { token }).toPromise();
        }
        this.router.navigate(['/dashboard']);
      })
      .catch(error => {
        console.error('Google login error:', error);
        throw error;
      });
  }

  async logout(): Promise<void> {
    try {
      // Call backend to clear cookie
      await this.http.post(`${this.apiUrl}/logout`, {}).toPromise();

      // Sign out from Firebase
      await this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Token management
  async getToken(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? await user.getIdToken() : null;
  }

  // Auth state
  isLoggedIn(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => !!user)
    );
  }

  isEmailVerified(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => user?.emailVerified || false)
    );
  }
// TODO: Implement this method
  isAuthenticated(): Observable<boolean> {
    const token = localStorage.getItem('token');
    return of(token !== null);
  }


}
