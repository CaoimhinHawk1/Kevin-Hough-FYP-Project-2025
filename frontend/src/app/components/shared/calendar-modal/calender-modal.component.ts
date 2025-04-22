// frontend/src/app/components/shared/calendar-modal/calendar-modal.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatCalendar} from '@angular/material/datepicker';

interface CalendarModalData {
  selectedDate: Date;
  title?: string;
}

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCalendar
  ],
  template: `
    <div class="calendar-modal p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-medium">{{ data.title || 'Select Date' }}</h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-calendar
        [(selected)]="selectedDate"
        (selectedChange)="onDateSelected($event)">
      </mat-calendar>

      <div class="flex justify-end mt-4 gap-2">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()">Select</button>
      </div>
    </div>
  `,
  styles: [`
    .calendar-modal {
      max-width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    ::ng-deep .mat-calendar {
      width: 100%;
    }
  `]
})
export class CalendarModalComponent {
  selectedDate: Date | null;

  constructor(
    public dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CalendarModalData
  ) {
    this.selectedDate = data.selectedDate || new Date();
  }

  onDateSelected(date: Date | null): void {
    this.selectedDate = date;
  }

  onSave(): void {
    this.dialogRef.close(this.selectedDate);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
