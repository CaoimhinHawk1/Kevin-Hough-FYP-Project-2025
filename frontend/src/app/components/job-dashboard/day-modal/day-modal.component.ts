// src/app/components/job-dashboard/modals/day-modal.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface DialogData {
  title: string;
  date: string;
  events: any[];
  isToday: boolean;
  eventDetails?: any;
}

@Component({
  selector: 'app-day-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold" [class.text-blue-600]="data.isToday">{{ data.title }}</h2>
        <button mat-icon-button (click)="close()">
          <span class="text-gray-500 text-2xl">&times;</span>
        </button>
      </div>

      <!-- Single event details -->
      <div *ngIf="data.eventDetails" class="mb-6">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="text-sm text-gray-600">Location</label>
            <p class="font-medium">{{ data.eventDetails.location }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Date</label>
            <p class="font-medium">{{ data.date }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Status</label>
            <p [ngClass]="{
              'font-medium text-green-600': data.eventDetails.status === 'Confirmed',
              'font-medium text-yellow-600': data.eventDetails.status === 'Pending',
              'font-medium text-red-600': data.eventDetails.status === 'Cancelled'
            }">{{ data.eventDetails.status }}</p>
          </div>
        </div>
        <div class="mb-4">
          <label class="text-sm text-gray-600">Description</label>
          <p class="font-medium">{{ data.eventDetails.description }}</p>
        </div>
        <div class="flex justify-end gap-2">
          <button mat-button color="basic" (click)="close()">Close</button>
          <button mat-raised-button color="primary" (click)="editEvent(data.eventDetails)">Edit Job</button>
        </div>
      </div>

      <!-- Multiple events for a day -->
      <div *ngIf="!data.eventDetails && data.events.length > 0" class="mt-4">
        <h3 class="text-lg font-medium mb-3">Events for this day</h3>
        <div class="space-y-3">
          <div *ngFor="let event of data.events"
               class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
               (click)="viewEvent(event)">
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ event.location }}</span>
              <span [ngClass]="{
                'text-sm text-green-600': event.status === 'Confirmed',
                'text-sm text-yellow-600': event.status === 'Pending',
                'text-sm text-red-600': event.status === 'Cancelled'
              }">{{ event.status }}</span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ event.description }}</p>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button mat-button (click)="close()">Close</button>
        </div>
      </div>

      <!-- No events for day -->
      <div *ngIf="!data.eventDetails && data.events.length === 0" class="py-8 text-center">
        <p class="text-gray-500">No events scheduled for this day</p>
        <button mat-button color="primary" class="mt-4" (click)="close()">Close</button>
      </div>
    </div>
  `,
  styles: []
})
export class DayModalComponent {
  constructor(
    public dialogRef: MatDialogRef<DayModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  viewEvent(event: any): void {
    // Close this dialog and open a new one with the event details
    this.dialogRef.close(event);
  }

  editEvent(event: any): void {
    this.dialogRef.close({
      action: 'edit',
      event: event
    });
  }
}
