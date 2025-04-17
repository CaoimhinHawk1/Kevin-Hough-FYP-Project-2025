// frontend/src/app/components/task-dashboard/task-dialog/task-dialog.component.ts
import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Task } from '../../../../services/task.service';
import { UserService, UserProfile } from '../../../../services/user.service';

interface DialogData {
  task: Task;
  isEditing: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="text-xl font-semibold">
        {{ data.isNew ? 'Create New Task' : data.isEditing ? 'Edit Task' : 'Task Details' }}
      </h2>

      <div mat-dialog-content class="mt-4">
        <!-- View Mode -->
        <div *ngIf="!data.isEditing">
          <div class="flex items-start mb-4">
            <div [ngClass]="getTaskTypeClass()" class="task-type-icon">
              <mat-icon>{{ getTaskTypeIcon() }}</mat-icon>
            </div>
            <div>
              <h3 class="text-xl font-medium">{{ data.task.title }}</h3>
              <div class="mt-1 flex items-center">
                <span
                  class="inline-block h-2 w-2 rounded-full mr-2"
                  [ngClass]="getPriorityClass()">
                </span>
                <span class="text-sm text-gray-600 capitalize">{{ data.task.priority }} Priority</span>
                <span class="mx-2 text-gray-300">|</span>
                <span
                  class="text-sm capitalize px-2 py-0.5 rounded-full border"
                  [ngClass]="getStatusClass()">
                  {{ data.task.status.replace('_', ' ') }}
                </span>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <p class="whitespace-pre-line">{{ data.task.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-gray-500">Due Date</p>
              <p class="font-medium" [ngClass]="{'text-red-600': isOverdue(data.task.dueDate)}">
                {{ formatDate(data.task.dueDate) }}
              </p>
            </div>

            <div *ngIf="data.task.eventName">
              <p class="text-sm text-gray-500">Event</p>
              <p class="font-medium">{{ data.task.eventName }}</p>
            </div>

            <div *ngIf="data.task.location">
              <p class="text-sm text-gray-500">Location</p>
              <p class="font-medium">{{ data.task.location }}</p>
            </div>

            <div *ngIf="data.task.status === 'completed' && data.task.completedAt">
              <p class="text-sm text-gray-500">Completed</p>
              <p class="font-medium">
                {{ formatDate(data.task.completedAt) }}
                <span *ngIf="data.task.completedBy"> by {{ data.task.completedBy }}</span>
              </p>
            </div>
          </div>

          <mat-divider class="mb-4"></mat-divider>

          <div class="mb-6">
            <p class="text-sm text-gray-500 mb-2">Assigned To</p>
            <div class="flex flex-wrap gap-2">
              <div
                *ngFor="let person of data.task.assignedTo"
                class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                {{ person }}
              </div>
              <div *ngIf="!data.task.assignedTo || data.task.assignedTo.length === 0" class="text-gray-500">
                No assignments
              </div>
            </div>
          </div>

          <div *ngIf="data.task.relatedItems && data.task.relatedItems.length > 0" class="mb-6">
            <p class="text-sm text-gray-500 mb-2">Related Items</p>
            <div class="flex flex-wrap gap-2">
              <div
                *ngFor="let item of data.task.relatedItems"
                class="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                {{ item }}
              </div>
            </div>
          </div>

          <div *ngIf="data.task.notes" class="mb-6">
            <p class="text-sm text-gray-500 mb-1">Notes</p>
            <p class="whitespace-pre-line">{{ data.task.notes }}</p>
          </div>
        </div>

        <!-- Edit Mode -->
        <form *ngIf="data.isEditing" #taskForm="ngForm">
          <div class="mb-4">
            <mat-form-field class="w-full">
              <mat-label>Task Title</mat-label>
              <input matInput [(ngModel)]="data.task.title" name="title" required>
            </mat-form-field>
          </div>

          <div class="mb-4">
            <mat-form-field class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="data.task.description" name="description" rows="3"></textarea>
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <mat-form-field>
              <mat-label>Task Type</mat-label>
              <mat-select [(ngModel)]="data.task.type" name="type" required>
                <mat-option value="marquee">Marquee</mat-option>
                <mat-option value="toilet">Toilet</mat-option>
                <mat-option value="equipment">Equipment</mat-option>
                <mat-option value="vehicle">Vehicle</mat-option>
                <mat-option value="general">General</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Priority</mat-label>
              <mat-select [(ngModel)]="data.task.priority" name="priority" required>
                <mat-option value="low">Low</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="high">High</mat-option>
                <mat-option value="urgent">Urgent</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <mat-form-field>
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="data.task.status" name="status" required>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="in_progress">In Progress</mat-option>
                <mat-option value="completed">Completed</mat-option>
                <mat-option value="delayed">Delayed</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Due Date</mat-label>
              <input matInput [matDatepicker]="dueDatePicker" [(ngModel)]="data.task.dueDate" name="dueDate" required>
              <mat-datepicker-toggle matIconSuffix [for]="dueDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #dueDatePicker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <mat-form-field>
              <mat-label>Event Name</mat-label>
              <input matInput [(ngModel)]="data.task.eventName" name="eventName">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Location</mat-label>
              <input matInput [(ngModel)]="data.task.location" name="location">
            </mat-form-field>
          </div>

          <!-- Assigned Users Multi-select -->
          <div class="mb-4">
            <mat-form-field class="w-full">
              <mat-label>Assign To</mat-label>
              <mat-select [(ngModel)]="selectedUserIds" name="assignedTo" multiple>
                <mat-option *ngFor="let user of availableUsers" [value]="user.uid">
                  {{ user.displayName }} ({{ user.email }})
                </mat-option>
              </mat-select>
            </mat-form-field>
            <div *ngIf="loading" class="text-sm text-gray-500">Loading users...</div>
            <div *ngIf="userError" class="text-sm text-red-500">{{ userError }}</div>
          </div>

          <div class="mb-4">
            <mat-form-field class="w-full">
              <mat-label>Related Items (comma separated)</mat-label>
              <input matInput [(ngModel)]="relatedItemsString" name="relatedItems"
                     (blur)="updateRelatedItems()" placeholder="e.g. 40x60 Marquee #1, Truck #2">
            </mat-form-field>
          </div>

          <div class="mb-4">
            <mat-form-field class="w-full">
              <mat-label>Notes</mat-label>
              <textarea matInput [(ngModel)]="data.task.notes" name="notes" rows="3"></textarea>
            </mat-form-field>
          </div>
        </form>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.isEditing ? 'Cancel' : 'Close' }}
        </button>

        <ng-container *ngIf="!data.isEditing">
          <button mat-button color="primary" (click)="onEdit()">
            Edit
          </button>
          <button
            mat-raised-button
            color="primary"
            [disabled]="data.task.status === 'completed'"
            (click)="onComplete()">
            Mark Complete
          </button>
        </ng-container>

        <button
          *ngIf="data.isEditing"
          mat-raised-button
          color="primary"
          [disabled]="taskForm && taskForm.invalid || loading"
          (click)="onSave()">
          {{ loading ? 'Saving...' : (data.isNew ? 'Create' : 'Save') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .task-type-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 16px;
    }

    .marquee-task {
      background-color: #e3f2fd;
      color: #2196f3;
    }

    .toilet-task {
      background-color: #e8f5e9;
      color: #4caf50;
    }

    .equipment-task {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .vehicle-task {
      background-color: #f3e5f5;
      color: #9c27b0;
    }

    .general-task {
      background-color: #eeeeee;
      color: #607d8b;
    }

    .priority-low {
      background-color: #4caf50;
    }

    .priority-medium {
      background-color: #2196f3;
    }

    .priority-high {
      background-color: #ff9800;
    }

    .priority-urgent {
      background-color: #f44336;
    }

    .status-in-progress {
      color: #2196f3;
      border-color: #2196f3;
    }

    .status-pending {
      color: #ff9800;
      border-color: #ff9800;
    }

    .status-completed {
      color: #4caf50;
      border-color: #4caf50;
    }

    .status-delayed {
      color: #f44336;
      border-color: #f44336;
    }
  `]
})
export class TaskDialogComponent implements OnInit {
  @ViewChild('taskForm') taskForm?: NgForm;

  // For user assignment
  availableUsers: UserProfile[] = [];
  selectedUserIds: string[] = [];
  loading = false;
  userError = '';

  // For related items
  relatedItemsString: string = '';

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private userService: UserService
  ) {
    // Initialize string representations for the arrays
    this.relatedItemsString = data.task.relatedItems ? data.task.relatedItems.join(', ') : '';
  }

  ngOnInit(): void {
    if (this.data.isEditing) {
      this.loadUsers();

      // If editing an existing task, get the assigned user IDs
      // Assuming assignedTo contains just the user names, we will need to match them up
      // In a real implementation, you might want to store userIds along with names
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.userError = '';

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.userError = 'Failed to load users. Please try again.';
        this.loading = false;
      }
    });
  }

  updateRelatedItems(): void {
    if (this.relatedItemsString.trim()) {
      this.data.task.relatedItems = this.relatedItemsString
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    } else {
      this.data.task.relatedItems = [];
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit' });
  }

  onComplete(): void {
    this.dialogRef.close({ action: 'complete' });
  }

  onSave(): void {
    // Make sure the related items are updated
    this.updateRelatedItems();

    // Process selected users
    if (this.selectedUserIds.length > 0) {
      // Map user IDs to user names for display in UI
      this.data.task.assignedTo = this.selectedUserIds.map(uid => {
        const user = this.availableUsers.find(u => u.uid === uid);
        return user ? user.displayName : 'Unknown User';
      });

      // Add a hidden field to store the actual UIDs
      (this.data.task as any).assignedUserIds = this.selectedUserIds;
    } else {
      this.data.task.assignedTo = [];
      (this.data.task as any).assignedUserIds = [];
    }

    this.dialogRef.close({ action: 'save', task: this.data.task });
  }

  getTaskTypeClass(): string {
    switch (this.data.task.type) {
      case 'marquee': return 'marquee-task';
      case 'toilet': return 'toilet-task';
      case 'equipment': return 'equipment-task';
      case 'vehicle': return 'vehicle-task';
      case 'general': return 'general-task';
      default: return 'general-task';
    }
  }

  getTaskTypeIcon(): string {
    switch (this.data.task.type) {
      case 'marquee': return 'business';
      case 'toilet': return 'wc';
      case 'equipment': return 'handyman';
      case 'vehicle': return 'local_shipping';
      case 'general': return 'assignment';
      default: return 'assignment';
    }
  }

  getPriorityClass(): string {
    switch (this.data.task.priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'urgent': return 'priority-urgent';
      default: return '';
    }
  }

  getStatusClass(): string {
    switch (this.data.task.status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'delayed': return 'status-delayed';
      default: return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() < today.getTime();
  }
}
// :+)
