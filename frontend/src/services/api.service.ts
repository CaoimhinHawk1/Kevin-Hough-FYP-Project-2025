import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment/environment';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private afAuth: AngularFireAuth
  ) {}

  // Helper method to get auth token
  private async getAuthHeaders(): Promise<HttpHeaders> {
    const user = await this.afAuth.currentUser;
    const token = user ? await user.getIdToken() : '';

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Generic error handler
  private handleError(error: any) {
    console.error('API error', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  // EVENTS API
  getEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`)
      .pipe(catchError(this.handleError));
  }

  getEvent(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}`)
      .pipe(catchError(this.handleError));
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, eventData)
      .pipe(catchError(this.handleError));
  }

  updateEvent(id: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${id}`, eventData)
      .pipe(catchError(this.handleError));
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`)
      .pipe(catchError(this.handleError));
  }

  // CUSTOMERS API
  getCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers`)
      .pipe(catchError(this.handleError));
  }

  getCustomer(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers/${id}`)
      .pipe(catchError(this.handleError));
  }

  createCustomer(customerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers`, customerData)
      .pipe(catchError(this.handleError));
  }

  updateCustomer(id: string, customerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/customers/${id}`, customerData)
      .pipe(catchError(this.handleError));
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ITEMS API
  getItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`)
      .pipe(catchError(this.handleError));
  }

  getItem(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/items/${id}`)
      .pipe(catchError(this.handleError));
  }

  createItem(itemData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, itemData)
      .pipe(catchError(this.handleError));
  }

  updateItem(id: string, itemData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/items/${id}`, itemData)
      .pipe(catchError(this.handleError));
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${id}`)
      .pipe(catchError(this.handleError));
  }

  // AUTH API
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  register(userData: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData)
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(catchError(this.handleError));
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email })
      .pipe(catchError(this.handleError));
  }
}
