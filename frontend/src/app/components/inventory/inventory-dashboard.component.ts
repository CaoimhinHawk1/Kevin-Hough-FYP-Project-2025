// frontend/src/app/components/inventory/inventory-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from '../../../services/inventory.service';
import { ItemEditDialogComponent } from './item-edit-dialog/item-edit-dialog.component';
import { DashboardLayoutComponent } from '../shared/dashboard-layout/dashboard-layout.component';

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

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    DashboardLayoutComponent
  ],
  template: `
    <!-- frontend/src/app/components/inventory/inventory-dashboard.component.html -->
    <app-dashboard-layout pageTitle="Inventory Management">
      <div class="max-w-7xl mx-auto">
        <!-- Header with stats -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Marquees -->
          <mat-card class="p-4 rounded-lg shadow-sm">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <mat-icon>business</mat-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Marquees</p>
                <p class="text-xl font-semibold">{{ marqueeStats.total }}</p>
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500">
              {{ marqueeStats.available }} available
            </div>
          </mat-card>

          <!-- Total Toilets -->
          <mat-card class="p-4 rounded-lg shadow-sm">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <mat-icon>wc</mat-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Toilets</p>
                <p class="text-xl font-semibold">{{ toiletStats.total }}</p>
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500">
              {{ toiletStats.available }} available
            </div>
          </mat-card>

          <!-- Maintenance Required -->
          <mat-card class="p-4 rounded-lg shadow-sm">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <mat-icon>build</mat-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Maintenance Required</p>
                <p class="text-xl font-semibold">{{ maintenanceCount }}</p>
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500">
              {{ nextMaintenanceDate | date:'mediumDate' }}
            </div>
          </mat-card>

          <!-- Utilization Rate -->
          <mat-card class="p-4 rounded-lg shadow-sm">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <mat-icon>insert_chart</mat-icon>
              </div>
              <div>
                <p class="text-sm text-gray-500">Utilization Rate</p>
                <p class="text-xl font-semibold">{{ utilizationRate }}%</p>
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500">
              Last 30 days
            </div>
          </mat-card>
        </div>

        <!-- Filter and Actions -->
        <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div class="flex flex-col sm:flex-row gap-4">
            <mat-form-field appearance="outline" class="w-full sm:w-60">
              <mat-label>Search Inventory</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Name, ID, etc." #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full sm:w-36">
              <mat-label>Type</mat-label>
              <mat-select [(value)]="selectedType" (selectionChange)="filterByType()">
                <mat-option value="all">All</mat-option>
                <mat-option value="marquee">Marquees</mat-option>
                <mat-option value="toilet">Toilets</mat-option>
                <mat-option value="furniture">Furniture</mat-option>
                <mat-option value="lighting">Lighting</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full sm:w-36">
              <mat-label>Condition</mat-label>
              <mat-select [(value)]="selectedCondition" (selectionChange)="filterByCondition()">
                <mat-option value="all">All</mat-option>
                <mat-option value="excellent">Excellent</mat-option>
                <mat-option value="good">Good</mat-option>
                <mat-option value="fair">Fair</mat-option>
                <mat-option value="poor">Poor</mat-option>
                <mat-option value="needs-repair">Needs Repair</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="flex gap-3">
            <button mat-flat-button color="primary" (click)="openAddItemDialog()">
              <mat-icon>add</mat-icon>
              Add Item
            </button>
            <button mat-stroked-button color="primary" (click)="exportInventory()">
              <mat-icon>file_download</mat-icon>
              Export
            </button>
          </div>
        </div>

        <!-- Tabs for different views -->
        <mat-card class="mb-6 shadow-sm">
          <mat-tab-group (selectedTabChange)="onTabChange($event)">
            <mat-tab label="All Items">
              <ng-template matTabContent>
                <div *ngIf="loading" class="flex justify-center py-10">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
                <div *ngIf="!loading" class="overflow-x-auto">
                  <table mat-table [dataSource]="filteredItems" matSort (matSortChange)="sortData($event)" class="w-full">
                    <!-- ID Column -->
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                      <td mat-cell *matCellDef="let item">{{ item.id }}</td>
                    </ng-container>

                    <!-- Name Column -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                      <td mat-cell *matCellDef="let item">{{ item.name }}</td>
                    </ng-container>

                    <!-- Type Column -->
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                      <td mat-cell *matCellDef="let item">
                        <span class="capitalize">{{ item.type }}</span>
                      </td>
                    </ng-container>

                    <!-- Quantity Column -->
                    <ng-container matColumnDef="quantity">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Quantity</th>
                      <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                    </ng-container>

                    <!-- Available Column -->
                    <ng-container matColumnDef="available">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Available</th>
                      <td mat-cell *matCellDef="let item">
                    <span [ngClass]="{
                      'text-green-600': item.available === item.quantity,
                      'text-amber-600': item.available > 0 && item.available < item.quantity,
                      'text-red-600': item.available === 0
                    }">
                      {{ item.available }}
                    </span>
                      </td>
                    </ng-container>

                    <!-- Condition Column -->
                    <ng-container matColumnDef="condition">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Condition</th>
                      <td mat-cell *matCellDef="let item">
                    <span class="px-2 py-1 rounded-full text-xs font-medium" [ngClass]="{
                      'bg-green-100 text-green-800': item.condition === 'excellent',
                      'bg-blue-100 text-blue-800': item.condition === 'good',
                      'bg-yellow-100 text-yellow-800': item.condition === 'fair',
                      'bg-orange-100 text-orange-800': item.condition === 'poor',
                      'bg-red-100 text-red-800': item.condition === 'needs-repair'
                    }">
                      {{ item.condition | titlecase }}
                    </span>
                      </td>
                    </ng-container>

                    <!-- Last Maintenance Column -->
                    <ng-container matColumnDef="lastMaintenance">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Maintenance</th>
                      <td mat-cell *matCellDef="let item">
                        {{ item.lastMaintenance ? (item.lastMaintenance | date:'mediumDate') : 'N/A' }}
                      </td>
                    </ng-container>

                    <!-- Next Maintenance Column -->
                    <ng-container matColumnDef="nextMaintenance">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Next Maintenance</th>
                      <td mat-cell *matCellDef="let item">
                    <span [ngClass]="{
                      'text-red-600 font-medium': item.nextMaintenance && isMaintenanceSoon(item.nextMaintenance)
                    }">
                      {{ item.nextMaintenance ? (item.nextMaintenance | date:'mediumDate') : 'N/A' }}
                    </span>
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let item">
                        <button mat-icon-button color="primary" (click)="editItem(item)">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="deleteItem(item)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                        (click)="viewItemDetails(row)"
                        class="cursor-pointer hover:bg-gray-50"></tr>

                    <!-- Row shown when there is no matching data. -->
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell py-4 text-center text-gray-500" [attr.colspan]="displayedColumns.length">
                        No data matching the filter "{{input.value}}"
                      </td>
                    </tr>
                  </table>

                  <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]"
                                 [pageSize]="10"
                                 [length]="filteredItems.length"
                                 (page)="onPageChange($event)"
                                 showFirstLastButtons
                                 aria-label="Select page of inventory items">
                  </mat-paginator>
                </div>
              </ng-template>
            </mat-tab>

            <mat-tab label="Marquees">
              <ng-template matTabContent>
                <div *ngIf="loading" class="flex justify-center py-10">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
                <div *ngIf="!loading" class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <mat-card *ngFor="let item of marqueeItems" class="p-4 cursor-pointer hover:shadow-md transition-shadow" (click)="viewItemDetails(item)">
                    <div class="flex items-center mb-3">
                      <div class="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mr-3">
                        <mat-icon>business</mat-icon>
                      </div>
                      <h3 class="text-lg font-medium">{{ item.name }}</h3>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p class="text-gray-500">Quantity:</p>
                        <p>{{ item.quantity }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Available:</p>
                        <p [ngClass]="{
                      'text-green-600': item.available === item.quantity,
                      'text-amber-600': item.available > 0 && item.available < item.quantity,
                      'text-red-600': item.available === 0
                    }">
                          {{ item.available }}
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-500">Condition:</p>
                        <p>{{ item.condition | titlecase }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Next Maintenance:</p>
                        <p>{{ item.nextMaintenance ? (item.nextMaintenance | date:'shortDate') : 'N/A' }}</p>
                      </div>
                    </div>

                    <div class="flex justify-end mt-3">
                      <button mat-icon-button color="primary" (click)="editItem(item); $event.stopPropagation()">
                        <mat-icon>edit</mat-icon>
                      </button>
                    </div>
                  </mat-card>
                </div>
              </ng-template>
            </mat-tab>

            <mat-tab label="Toilets">
              <ng-template matTabContent>
                <div *ngIf="loading" class="flex justify-center py-10">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
                <div *ngIf="!loading" class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <mat-card *ngFor="let item of toiletItems" class="p-4 cursor-pointer hover:shadow-md transition-shadow" (click)="viewItemDetails(item)">
                    <div class="flex items-center mb-3">
                      <div class="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3">
                        <mat-icon>wc</mat-icon>
                      </div>
                      <h3 class="text-lg font-medium">{{ item.name }}</h3>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p class="text-gray-500">Quantity:</p>
                        <p>{{ item.quantity }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Available:</p>
                        <p [ngClass]="{
                      'text-green-600': item.available === item.quantity,
                      'text-amber-600': item.available > 0 && item.available < item.quantity,
                      'text-red-600': item.available === 0
                    }">
                          {{ item.available }}
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-500">Condition:</p>
                        <p>{{ item.condition | titlecase }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Last Serviced:</p>
                        <p>{{ item.lastMaintenance ? (item.lastMaintenance | date:'shortDate') : 'N/A' }}</p>
                      </div>
                    </div>

                    <div class="flex justify-end mt-3">
                      <button mat-icon-button color="primary" (click)="editItem(item); $event.stopPropagation()">
                        <mat-icon>edit</mat-icon>
                      </button>
                    </div>
                  </mat-card>
                </div>
              </ng-template>
            </mat-tab>

            <mat-tab label="Maintenance">
              <ng-template matTabContent>
                <div *ngIf="loading" class="flex justify-center py-10">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
                <div *ngIf="!loading" class="p-4">
                  <h3 class="text-lg font-medium mb-4">Maintenance Schedule</h3>

                  <div class="mb-6">
                    <mat-form-field appearance="outline" class="w-full sm:w-60">
                      <mat-label>Filter by maintenance status</mat-label>
                      <mat-select [(value)]="maintenanceFilter" (selectionChange)="filterByMaintenance()">
                        <mat-option value="all">All Items</mat-option>
                        <mat-option value="upcoming">Upcoming Maintenance</mat-option>
                        <mat-option value="overdue">Overdue Maintenance</mat-option>
                        <mat-option value="needs-repair">Needs Repair</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <table mat-table [dataSource]="maintenanceItems" class="w-full">
                    <!-- Name Column -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let item">{{ item.name }}</td>
                    </ng-container>

                    <!-- Type Column -->
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let item">
                        <span class="capitalize">{{ item.type }}</span>
                      </td>
                    </ng-container>

                    <!-- Last Maintenance Column -->
                    <ng-container matColumnDef="lastMaintenance">
                      <th mat-header-cell *matHeaderCellDef>Last Maintenance</th>
                      <td mat-cell *matCellDef="let item">
                        {{ item.lastMaintenance ? (item.lastMaintenance | date:'mediumDate') : 'N/A' }}
                      </td>
                    </ng-container>

                    <!-- Next Maintenance Column -->
                    <ng-container matColumnDef="nextMaintenance">
                      <th mat-header-cell *matHeaderCellDef>Next Maintenance</th>
                      <td mat-cell *matCellDef="let item">
                    <span [ngClass]="{
                      'text-red-600 font-medium': isMaintenanceOverdue(item.nextMaintenance),
                      'text-amber-600 font-medium': isMaintenanceSoon(item.nextMaintenance) && !isMaintenanceOverdue(item.nextMaintenance)
                    }">
                      {{ item.nextMaintenance ? (item.nextMaintenance | date:'mediumDate') : 'N/A' }}
                    </span>
                      </td>
                    </ng-container>

                    <!-- Condition Column -->
                    <ng-container matColumnDef="condition">
                      <th mat-header-cell *matHeaderCellDef>Condition</th>
                      <td mat-cell *matCellDef="let item">
                    <span class="px-2 py-1 rounded-full text-xs font-medium" [ngClass]="{
                      'bg-green-100 text-green-800': item.condition === 'excellent',
                      'bg-blue-100 text-blue-800': item.condition === 'good',
                      'bg-yellow-100 text-yellow-800': item.condition === 'fair',
                      'bg-orange-100 text-orange-800': item.condition === 'poor',
                      'bg-red-100 text-red-800': item.condition === 'needs-repair'
                    }">
                      {{ item.condition | titlecase }}
                    </span>
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let item">
                        <button mat-button color="primary" (click)="scheduleMaintenance(item)">
                          Schedule
                        </button>
                        <button mat-button color="accent" (click)="completeMaintenance(item)">
                          Mark Complete
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="maintenanceColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: maintenanceColumns;"></tr>
                  </table>

                  <div *ngIf="maintenanceItems.length === 0" class="py-8 text-center text-gray-500">
                    No maintenance items to display
                  </div>
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>

      <!-- Add Item Button (FAB) -->
      <button
        (click)="openAddItemDialog()"
        class="fixed bottom-6 right-6 p-4 bg-[#6750A4] text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors z-10"
      >
        <mat-icon>add</mat-icon>
      </button>
    </app-dashboard-layout>
  `,
  styles: [`
    .mat-column-actions {
      width: 120px;
      text-align: center;
    }

    .mat-column-condition, .mat-column-type {
      width: 120px;
    }

    .mat-column-quantity, .mat-column-available {
      width: 100px;
      text-align: center;
    }

    .mat-column-id {
      width: 80px;
    }
  `]
})
export class InventoryDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Display settings
  displayedColumns: string[] = ['id', 'name', 'type', 'quantity', 'available', 'condition', 'lastMaintenance', 'nextMaintenance', 'actions'];
  maintenanceColumns: string[] = ['name', 'type', 'lastMaintenance', 'nextMaintenance', 'condition', 'actions'];

  // Data
  allItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  marqueeItems: InventoryItem[] = [];
  toiletItems: InventoryItem[] = [];
  maintenanceItems: InventoryItem[] = [];

  // Stats
  marqueeStats = {total: 0, available: 0};
  toiletStats = {total: 0, available: 0};
  maintenanceCount = 0;
  utilizationRate = 0;
  nextMaintenanceDate?: Date;

  // Filters
  selectedType = 'all';
  selectedCondition = 'all';
  maintenanceFilter = 'all';

  // State
  loading = true;

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.loadInventory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInventory(): void {
    this.loading = true;
    this.inventoryService.getAllItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.allItems = items;
          this.filteredItems = [...items];
          this.filterItemsByType();
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading inventory:', error);
          this.loading = false;
          // You might want to add an error message display here
        }
      });
  }

  filterItemsByType(): void {
    // Filter marquees
    this.marqueeItems = this.allItems.filter(item => item.type === 'marquee');

    // Filter toilets
    this.toiletItems = this.allItems.filter(item => item.type === 'toilet');

    // Filter maintenance items
    this.maintenanceItems = this.allItems.filter(item =>
      this.isMaintenanceSoon(item.nextMaintenance) ||
      item.condition === 'needs-repair' ||
      item.condition === 'poor'
    );
  }

  calculateStats(): void {
    // Marquee stats
    const marquees = this.allItems.filter(item => item.type === 'marquee');
    this.marqueeStats.total = marquees.reduce((sum, item) => sum + item.quantity, 0);
    this.marqueeStats.available = marquees.reduce((sum, item) => sum + item.available, 0);

    // Toilet stats
    const toilets = this.allItems.filter(item => item.type === 'toilet');
    this.toiletStats.total = toilets.reduce((sum, item) => sum + item.quantity, 0);
    this.toiletStats.available = toilets.reduce((sum, item) => sum + item.available, 0);

    // Maintenance count
    this.maintenanceCount = this.maintenanceItems.length;

    // Utilization rate - simplified calculation for demo
    const totalItems = this.allItems.reduce((sum, item) => sum + item.quantity, 0);
    const availableItems = this.allItems.reduce((sum, item) => sum + item.available, 0);
    this.utilizationRate = totalItems > 0 ? Math.round(((totalItems - availableItems) / totalItems) * 100) : 0;

    // Next maintenance date
    const maintenanceDates = this.allItems
      .filter(item => item.nextMaintenance)
      .map(item => item.nextMaintenance as Date)
      .sort((a, b) => a.getTime() - b.getTime());

    this.nextMaintenanceDate = maintenanceDates.length > 0 ? maintenanceDates[0] : undefined;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (filterValue) {
      this.filteredItems = this.allItems.filter(item =>
        item.name.toLowerCase().includes(filterValue) ||
        item.id.toLowerCase().includes(filterValue) ||
        item.type.toLowerCase().includes(filterValue)
      );
    } else {
      this.filteredItems = [...this.allItems];
    }

    // Apply any active type/condition filters
    this.applyActiveFilters();
  }

  filterByType(): void {
    this.applyActiveFilters();
  }

  filterByCondition(): void {
    this.applyActiveFilters();
  }

  applyActiveFilters(): void {
    let filtered = [...this.allItems];

    // Apply type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === this.selectedType);
    }

    // Apply condition filter
    if (this.selectedCondition !== 'all') {
      filtered = filtered.filter(item => item.condition === this.selectedCondition);
    }

    this.filteredItems = filtered;
  }

  onTabChange(event: any): void {
    // Reset filters when changing tabs
    this.selectedType = 'all';
    this.selectedCondition = 'all';
    this.maintenanceFilter = 'all';

    // If switching to maintenance tab, update the maintenance items
    if (event.index === 3) { // Maintenance tab index
      this.filterByMaintenance();
    }
  }

  sortData(sort: Sort): void {
    const data = [...this.filteredItems];

    if (!sort.active || sort.direction === '') {
      this.filteredItems = data;
      return;
    }

    this.filteredItems = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'type': return this.compare(a.type, b.type, isAsc);
        case 'quantity': return this.compare(a.quantity, b.quantity, isAsc);
        case 'available': return this.compare(a.available, b.available, isAsc);
        case 'condition': return this.compare(a.condition, b.condition, isAsc);
        case 'lastMaintenance':
          if (!a.lastMaintenance) return isAsc ? -1 : 1;
          if (!b.lastMaintenance) return isAsc ? 1 : -1;
          return this.compare(a.lastMaintenance.getTime(), b.lastMaintenance.getTime(), isAsc);
        case 'nextMaintenance':
          if (!a.nextMaintenance) return isAsc ? -1 : 1;
          if (!b.nextMaintenance) return isAsc ? 1 : -1;
          return this.compare(a.nextMaintenance.getTime(), b.nextMaintenance.getTime(), isAsc);
        default: return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onPageChange(event: PageEvent): void {
    // Handle pagination - typically would be used with server-side pagination
    console.log('Page event:', event);
  }

  isMaintenanceSoon(date?: Date): boolean {
    if (!date) return false;

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return date <= thirtyDaysFromNow;
  }

  isMaintenanceOverdue(date?: Date): boolean {
    if (!date) return false;

    const today = new Date();
    return date < today;
  }

  openAddItemDialog(): void {
    const dialogRef = this.dialog.open(ItemEditDialogComponent, {
      width: '600px',
      data: {
        isNew: true,
        item: {
          id: '',
          name: '',
          type: '',
          quantity: 1,
          available: 1,
          condition: 'good'
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inventoryService.createItem(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (newItem) => {
              this.allItems.push(newItem);
              this.filterItemsByType();
              this.calculateStats();
              this.applyActiveFilters();
            },
            error: (error) => console.error('Error creating item:', error)
          });
      }
    });
  }

  editItem(item: InventoryItem): void {
    const dialogRef = this.dialog.open(ItemEditDialogComponent, {
      width: '600px',
      data: { isNew: false, item: { ...item } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inventoryService.updateItem(result.id, result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updatedItem) => {
              const index = this.allItems.findIndex(i => i.id === updatedItem.id);
              if (index !== -1) {
                this.allItems[index] = updatedItem;
                this.filterItemsByType();
                this.calculateStats();
                this.applyActiveFilters();
              }
            },
            error: (error) => console.error('Error updating item:', error)
          });
      }
    });
  }

  deleteItem(item: InventoryItem): void {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      this.inventoryService.deleteItem(item.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.allItems = this.allItems.filter(i => i.id !== item.id);
            this.filterItemsByType();
            this.calculateStats();
            this.applyActiveFilters();
          },
          error: (error) => console.error('Error deleting item:', error)
        });
    }
  }

  viewItemDetails(item: InventoryItem): void {
    // You could open a detailed view dialog or navigate to a details page
    console.log('View item details:', item);
    this.dialog.open(ItemEditDialogComponent, {
      width: '600px',
      data: { isNew: false, item: { ...item }, readonly: true }
    });
  }

  scheduleMaintenance(item: InventoryItem): void {
    // Logic to schedule maintenance
    const today = new Date();
    const scheduledDate = new Date();
    scheduledDate.setDate(today.getDate() + 7); // Schedule a week from now

    const updatedItem = {
      ...item,
      nextMaintenance: scheduledDate
    };

    this.inventoryService.updateItem(item.id, updatedItem)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const index = this.allItems.findIndex(i => i.id === result.id);
          if (index !== -1) {
            this.allItems[index] = result;
            this.filterItemsByType();
            this.calculateStats();
            this.applyActiveFilters();
            this.filterByMaintenance();
          }
        },
        error: (error) => console.error('Error scheduling maintenance:', error)
      });
  }

  completeMaintenance(item: InventoryItem): void {
    // Logic to mark maintenance as complete
    const today = new Date();
    const nextMaintenanceDate = new Date();
    nextMaintenanceDate.setMonth(today.getMonth() + 3); // Set next maintenance for 3 months later

    const updatedItem = {
      ...item,
      lastMaintenance: today,
      nextMaintenance: nextMaintenanceDate,
      condition: 'good' as const // Improve condition after maintenance
    };

    this.inventoryService.updateItem(item.id, updatedItem)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const index = this.allItems.findIndex(i => i.id === result.id);
          if (index !== -1) {
            this.allItems[index] = result;
            this.filterItemsByType();
            this.calculateStats();
            this.applyActiveFilters();
            this.filterByMaintenance();
          }
        },
        error: (error) => console.error('Error completing maintenance:', error)
      });
  }

  exportInventory(): void {
    // In a real app, this would generate a CSV or Excel file
    console.log('Exporting inventory data...');

    // Simple export to JSON for demonstration
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.allItems));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "inventory_export.json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }


  filterByMaintenance(): void {
    switch (this.maintenanceFilter) {
      case 'upcoming':
        this.maintenanceItems = this.allItems.filter(item =>
          item.nextMaintenance && this.isMaintenanceSoon(item.nextMaintenance) && !this.isMaintenanceOverdue(item.nextMaintenance)
        );
        break;
      case 'overdue':
        this.maintenanceItems = this.allItems.filter(item =>
          item.nextMaintenance && this.isMaintenanceOverdue(item.nextMaintenance)
        );
        break;
      case 'needs-repair':
        this.maintenanceItems = this.allItems.filter(item =>
          item.condition === 'needs-repair' || item.condition === 'poor'
        );
        break;
      default:
        this.maintenanceItems = this.allItems.filter(item =>
          this.isMaintenanceSoon(item.nextMaintenance) ||
          item.condition === 'needs-repair' ||
          item.condition === 'poor'
        );
    }
  }
}
