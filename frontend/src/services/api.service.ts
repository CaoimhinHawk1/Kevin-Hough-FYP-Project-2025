import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Generic error handler
  private handleError(error: any) {
    console.error('API error', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  // EVENTS API
  getEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  getEvent(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, eventData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  updateEvent(id: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${id}`, eventData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // CUSTOMERS API
  getCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  getCustomer(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  createCustomer(customerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers`, customerData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  updateCustomer(id: string, customerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/customers/${id}`, customerData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // ITEMS API
  getItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  getItem(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/items/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  createItem(itemData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, itemData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  updateItem(id: string, itemData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/items/${id}`, itemData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${id}`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
}
