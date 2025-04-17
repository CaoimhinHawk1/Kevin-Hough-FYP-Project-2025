// frontend/src/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment/environment';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users (for task assignment)
   */
  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching users:', error);
          return of([]);
        })
      );
  }

  /**
   * Get a user by their ID
   */
  getUserById(uid: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${uid}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching user ${uid}:`, error);
          throw error;
        })
      );
  }
}
