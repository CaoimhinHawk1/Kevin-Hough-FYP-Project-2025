// frontend/src/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../environment/environment';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string | null;
  emailVerified: boolean;
  role?: string;       // Added role
  isAdmin?: boolean;   // Added admin flag
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private adminApiUrl = `${environment.apiUrl}/admin/users`;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  private auth;

  // Observable for components to subscribe to
  public currentUser$ = this.currentUserSubject.asObservable();

  // Initialize Firebase for Google Auth
  private firebaseApp = initializeApp(environment.firebase);

  constructor(private http: HttpClient, private router: Router) {
    // Initialize Firebase Auth
    this.auth = getAuth(this.firebaseApp);

    // Check if we have a current user in the local storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }

    // Check if the user is already authenticated with the backend
    this.checkAuthStatus().subscribe();
  }

  /**
   * Check the current authentication status with the backend
   */
  checkAuthStatus(): Observable<AuthUser | null> {
    console.log('AuthService: Checking auth status with backend...');
    return this.http.get<{ user: AuthUser }>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(
        map(response => {
          console.log('AuthService: Backend response:', response);
          const user = response.user;
          this.setCurrentUser(user);
          return user;
        }),
        catchError(error => {
          console.error('AuthService: Auth check error:', error);
          this.clearCurrentUser();
          return of(null);
        })
      );
  }

  /**
   * Register a new user with email and password
   */
  register(email: string, password: string, displayName?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`,
      { email, password, displayName },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.user) {
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.user) {
          this.setCurrentUser(response.user);
          // Don't navigate here, let the component handle it
        }
      })
    );
  }

  /**
   * Logout the current user
   */
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearCurrentUser();
          this.router.navigate(['/login']);
        })
      );
  }

  /**
   * Send password reset email
   */
  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    console.log('AuthService: Checking authentication status...');

    // First check if we have a user in memory
    if (this.currentUserSubject.value) {
      console.log('AuthService: User found in memory');
      return of(true);
    }

    // If not, check with the backend
    return this.checkAuthStatus().pipe(
      map(user => {
        const isAuth = !!user;
        console.log('AuthService: Backend auth check result:', isAuth);
        return isAuth;
      }),
      catchError(error => {
        console.error('AuthService: Error checking auth status:', error);
        return of(false);
      })
    );
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user && !!user.isAdmin)
    );
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): Observable<boolean> {
    const roleHierarchy: {[key: string]: number} = {
      'ADMIN': 3,
      'MANAGER': 2,
      'USER': 1
    };

    return this.currentUser$.pipe(
      map(user => {
        if (!user || !user.role) return false;
        return roleHierarchy[user.role] >= roleHierarchy[role];
      })
    );
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Set current user and store in local storage
   */
  private setCurrentUser(user: AuthUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Login with Google
   */
  loginWithGoogle(): Observable<any> {
    return from(this.signInWithGoogle()).pipe(
      switchMap(idToken => {
        return this.http.post<any>(`${this.apiUrl}/google-login`,
          { idToken },
          { withCredentials: true }
        ).pipe(
          tap(response => {
            if (response.user) {
              this.setCurrentUser(response.user);
              // Don't navigate here, let the component handle it
            }
          })
        );
      }),
      catchError(error => {
        console.error('Google login error:', error);
        return throwError(() => new Error(error.message || 'Google login failed'));
      })
    );
  }

  /**
   * Sign in with Google popup and get ID token
   */
  private async signInWithGoogle(): Promise<string> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential || !credential.idToken) {
        throw new Error('No ID token returned from Google');
      }

      return credential.idToken;
    } catch (error) {
      console.error('Error during Google popup sign in:', error);
      throw error;
    }
  }

  /**
   * Clear current user from memory and local storage
   */
  private clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Admin-specific methods

  /**
   * Get all users (admin only)
   */
  getAllUsers(): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>(`${this.adminApiUrl}`, { withCredentials: true });
  }

  /**
   * Get user by ID (admin only)
   */
  getUserById(id: string): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.adminApiUrl}/${id}`, { withCredentials: true });
  }

  /**
   * Update user role (admin only)
   */
  updateUserRole(userId: string, role: string, isAdmin: boolean): Observable<any> {
    return this.http.patch<any>(
      `${this.adminApiUrl}/${userId}/role`,
      { role, isAdmin },
      { withCredentials: true }
    );
  }

  /**
   * Delete user (admin only)
   */
  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.adminApiUrl}/${userId}`, { withCredentials: true });
  }
}
