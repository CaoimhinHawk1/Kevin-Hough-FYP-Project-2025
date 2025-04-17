// frontend/src/services/inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environment/environment';

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  available: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs-repair';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  location?: string;
  notes?: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/items`;
  private mockItems: InventoryItem[] = []; // For demo purposes only

  constructor(private http: HttpClient) {
    // Initialize mock data for demonstration
    this.initMockData();
  }

  /**
   * Get all inventory items
   */
  getAllItems(): Observable<InventoryItem[]> {
    // Comment the mock implementation and uncomment the real one when ready
    return this.getMockItems();

    // Real implementation:
    // return this.http.get<InventoryItem[]>(this.apiUrl, { withCredentials: true })
    //   .pipe(
    //     map(items => this.processItemDates(items)),
    //     catchError(this.handleError)
    //   );
  }

  /**
   * Get a specific inventory item by ID
   */
  getItem(id: string): Observable<InventoryItem> {
    // Comment the mock implementation and uncomment the real one when ready
    return this.getMockItem(id);

    // Real implementation:
    // return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`, { withCredentials: true })
    //   .pipe(
    //     map(item => this.processItemDates([item])[0]),
    //     catchError(this.handleError)
    //   );
  }

  /**
   * Create a new inventory item
   */
  createItem(item: InventoryItem): Observable<InventoryItem> {
    // Comment the mock implementation and uncomment the real one when ready
    return this.createMockItem(item);

    // Real implementation:
    // return this.http.post<InventoryItem>(this.apiUrl, item, { withCredentials: true })
    //   .pipe(
    //     map(item => this.processItemDates([item])[0]),
    //     catchError(this.handleError)
    //   );
  }

  /**
   * Update an existing inventory item
   */
  updateItem(id: string, item: InventoryItem): Observable<InventoryItem> {
    // Comment the mock implementation and uncomment the real one when ready
    return this.updateMockItem(id, item);

    // Real implementation:
    // return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, item, { withCredentials: true })
    //   .pipe(
    //     map(item => this.processItemDates([item])[0]),
    //     catchError(this.handleError)
    //   );
  }

  /**
   * Delete an inventory item
   */
  deleteItem(id: string): Observable<void> {
    // Comment the mock implementation and uncomment the real one when ready
    return this.deleteMockItem(id);

    // Real implementation:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true })
    //   .pipe(
    //     catchError(this.handleError)
    //   );
  }

  /**
   * Helper method to convert date strings to Date objects
   */
  private processItemDates(items: any[]): InventoryItem[] {
    return items.map(item => ({
      ...item,
      lastMaintenance: item.lastMaintenance ? new Date(item.lastMaintenance) : undefined,
      nextMaintenance: item.nextMaintenance ? new Date(item.nextMaintenance) : undefined
    }));
  }

  /**
   * Error handler
   */
  private handleError(error: any) {
    console.error('API error', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  // ========== MOCK IMPLEMENTATION FOR DEMO PURPOSES ==========

  /**
   * Initialize mock data
   */
  private initMockData(): void {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    this.mockItems = [
      {
        id: '1',
        name: '40x60 Marquee',
        type: 'marquee',
        quantity: 3,
        available: 1,
        condition: 'excellent',
        lastMaintenance: lastWeek,
        nextMaintenance: nextMonth,
        location: 'Warehouse A',
        notes: 'Premium marquee for large events'
      },
      {
        id: '2',
        name: '20x30 Marquee',
        type: 'marquee',
        quantity: 5,
        available: 2,
        condition: 'good',
        lastMaintenance: lastWeek,
        nextMaintenance: nextMonth,
        location: 'Warehouse A',
        notes: 'Standard marquee for medium events'
      },
      {
        id: '3',
        name: '10x15 Marquee',
        type: 'marquee',
        quantity: 8,
        available: 4,
        condition: 'fair',
        lastMaintenance: lastWeek,
        nextMaintenance: yesterday, // Overdue maintenance
        location: 'Warehouse B',
        notes: 'Small marquee for intimate events'
      },
      {
        id: '4',
        name: 'Luxury Portable Toilet',
        type: 'toilet',
        quantity: 10,
        available: 3,
        condition: 'excellent',
        lastMaintenance: lastWeek,
        nextMaintenance: nextMonth,
        location: 'Warehouse C',
        notes: 'High-end portable toilets with sink and mirror'
      },
      {
        id: '5',
        name: 'Standard Portable Toilet',
        type: 'toilet',
        quantity: 20,
        available: 5,
        condition: 'good',
        lastMaintenance: lastWeek,
        nextMaintenance: nextMonth,
        location: 'Warehouse C',
        notes: 'Standard portable toilets for events'
      },
      {
        id: '6',
        name: 'Basic Portable Toilet',
        type: 'toilet',
        quantity: 15,
        available: 0,
        condition: 'needs-repair',
        lastMaintenance: lastWeek,
        nextMaintenance: today, // Due today
        location: 'Warehouse C',
        notes: 'Economy portable toilets'
      },
      {
        id: '7',
        name: 'Folding Chairs',
        type: 'furniture',
        quantity: 200,
        available: 50,
        condition: 'good',
        location: 'Warehouse B',
        notes: 'Standard white folding chairs'
      },
      {
        id: '8',
        name: 'Round Tables (8 person)',
        type: 'furniture',
        quantity: 30,
        available: 10,
        condition: 'excellent',
        location: 'Warehouse B',
        notes: '6ft round tables'
      },
      {
        id: '9',
        name: 'LED String Lights',
        type: 'lighting',
        quantity: 50,
        available: 20,
        condition: 'good',
        location: 'Warehouse A',
        notes: 'Warm white LED string lights'
      },
      {
        id: '10',
        name: 'Uplights',
        type: 'lighting',
        quantity: 40,
        available: 15,
        condition: 'fair',
        lastMaintenance: lastWeek,
        nextMaintenance: nextMonth,
        location: 'Warehouse A',
        notes: 'RGB LED uplights with remote control'
      }
    ];
  }

  /**
   * Get mock items
   */
  private getMockItems(): Observable<InventoryItem[]> {
    return of([...this.mockItems]);
  }

  /**
   * Get a mock item by ID
   */
  private getMockItem(id: string): Observable<InventoryItem> {
    const item = this.mockItems.find(item => item.id === id);
    if (item) {
      return of({...item});
    }
    return throwError(() => new Error(`Item with ID ${id} not found`));
  }

  /**
   * Create a mock item
   */
  private createMockItem(item: InventoryItem): Observable<InventoryItem> {
    const newItem = {
      ...item,
      id: (this.mockItems.length + 1).toString()
    };
    this.mockItems.push(newItem);
    return of({...newItem});
  }

  /**
   * Update a mock item
   */
  private updateMockItem(id: string, item: InventoryItem): Observable<InventoryItem> {
    const index = this.mockItems.findIndex(i => i.id === id);
    if (index !== -1) {
      this.mockItems[index] = {...item};
      return of({...this.mockItems[index]});
    }
    return throwError(() => new Error(`Item with ID ${id} not found`));
  }

  /**
   * Delete a mock item
   */
  private deleteMockItem(id: string): Observable<void> {
    const index = this.mockItems.findIndex(i => i.id === id);
    if (index !== -1) {
      this.mockItems.splice(index, 1);
      return of(void 0);
    }
    return throwError(() => new Error(`Item with ID ${id} not found`));
  }
}
