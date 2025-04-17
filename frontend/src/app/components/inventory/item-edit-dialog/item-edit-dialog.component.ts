// frontend/src/app/components/inventory/item-edit-dialog/item-edit-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

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

interface DialogData {
  isNew: boolean;
  item: InventoryItem;
  readonly?: boolean; // Explicitly mark as optional
}

@Component({
  selector: 'app-item-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isNew ? 'Add New Item' : 'Edit Item' }}</h2>
    <div mat-dialog-content>
      <form #itemForm="ngForm" class="flex flex-col gap-4">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput [(ngModel)]="data.item.name" name="name" required [readonly]="data.readonly || false">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="data.item.type" name="type" required [disabled]="data.readonly || false">
              <mat-option value="marquee">Marquee</mat-option>
              <mat-option value="toilet">Toilet</mat-option>
              <mat-option value="furniture">Furniture</mat-option>
              <mat-option value="lighting">Lighting</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" [(ngModel)]="data.item.quantity" name="quantity" required min="1" [readonly]="data.readonly || false">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Available</mat-label>
            <input matInput type="number" [(ngModel)]="data.item.available" name="available" required min="0" [max]="data.item.quantity" [readonly]="data.readonly || false">
            <mat-hint>Cannot exceed total quantity</mat-hint>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Condition</mat-label>
            <mat-select [(ngModel)]="data.item.condition" name="condition" required [disabled]="data.readonly || false">
              <mat-option value="excellent">Excellent</mat-option>
              <mat-option value="good">Good</mat-option>
              <mat-option value="fair">Fair</mat-option>
              <mat-option value="poor">Poor</mat-option>
              <mat-option value="needs-repair">Needs Repair</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Location</mat-label>
            <input matInput [(ngModel)]="data.item.location" name="location" [readonly]="data.readonly || false">
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Last Maintenance</mat-label>
            <input matInput [matDatepicker]="lastMaintenancePicker" [(ngModel)]="data.item.lastMaintenance" name="lastMaintenance" [readonly]="data.readonly || false">
            <mat-datepicker-toggle matIconSuffix [for]="lastMaintenancePicker" [disabled]="data.readonly || false"></mat-datepicker-toggle>
            <mat-datepicker #lastMaintenancePicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Next Maintenance</mat-label>
            <input matInput [matDatepicker]="nextMaintenancePicker" [(ngModel)]="data.item.nextMaintenance" name="nextMaintenance" [readonly]="data.readonly || false">
            <mat-datepicker-toggle matIconSuffix [for]="nextMaintenancePicker" [disabled]="data.readonly || false"></mat-datepicker-toggle>
            <mat-datepicker #nextMaintenancePicker></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Notes</mat-label>
          <textarea matInput [(ngModel)]="data.item.notes" name="notes" rows="3" [readonly]="data.readonly || false"></textarea>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.readonly ? 'Close' : 'Cancel' }}</button>
      <button
        *ngIf="!data.readonly"
        mat-raised-button
        color="primary"
        [disabled]="itemForm.invalid || (data.item.available > data.item.quantity)"
        (click)="onSave()">
        {{ data.isNew ? 'Add' : 'Save' }}
      </button>
    </div>
  `,
  styles: []
})
export class ItemEditDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ItemEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.isNew) {
      // Generate a temporary ID for new items (in a real app, the backend would do this)
      this.data.item.id = 'temp_' + Math.random().toString(36).substring(2, 9);
    }

    this.dialogRef.close(this.data.item);
  }
}
