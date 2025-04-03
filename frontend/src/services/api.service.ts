import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  // Events
  getEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`);
  }

  // Customers
  getCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers`);
  }

  // Items
  getItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`);
  }
}
