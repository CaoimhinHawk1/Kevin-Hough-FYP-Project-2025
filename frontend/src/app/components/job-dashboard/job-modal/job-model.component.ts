
import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

interface JobModalData {
  title: string;
  location: string;
  description: string;
  date: string;
  status: string;
  assignedTo: string[];
  equipment: string[];
}

@Component({
    selector: "app-modal",
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
    <div class="p-6 max-w-2xl">
      <h2 class="text-xl font-bold mb-4">{{ data.title }}</h2>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="text-sm text-gray-600">Location</label>
          <p class="font-medium">{{ data.location }}</p>
        </div>
        <div>
          <label class="text-sm text-gray-600">Date</label>
          <p class="font-medium">{{ data.date }}</p>
        </div>
        <div>
          <label class="text-sm text-gray-600">Status</label>
          <p [ngClass]="{
            'font-medium text-green-600': data.status === 'Confirmed',
            'font-medium text-yellow-600': data.status === 'Pending',
            'font-medium text-red-600': data.status === 'Cancelled'
          }">{{ data.status }}</p>
        </div>
      </div>

      <div class="mb-6">
        <label class="text-sm text-gray-600">Description</label>
        <p class="font-medium">{{ data.description }}</p>
      </div>

      <div class="mb-6">
        <label class="text-sm text-gray-600">Assigned Team</label>
        <div class="flex flex-wrap gap-2 mt-2">
          <span *ngFor="let member of data.assignedTo"
                class="px-3 py-1 bg-gray-100 rounded-full text-sm">
            {{ member }}
          </span>
        </div>
      </div>

      <div class="mb-6">
        <label class="text-sm text-gray-600">Equipment</label>
        <div class="flex flex-wrap gap-2 mt-2">
          <span *ngFor="let item of data.equipment"
                class="px-3 py-1 bg-gray-100 rounded-full text-sm">
            {{ item }}
          </span>
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <button mat-button (click)="dialogRef.close()">Close</button>
        <button mat-raised-button color="primary" (click)="dialogRef.close('edit')">
          Edit Job
        </button>
      </div>
    </div>
  `
})
export class JobModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: JobModalData,
    public dialogRef: MatDialogRef<JobModalComponent>
  ) {}
}
