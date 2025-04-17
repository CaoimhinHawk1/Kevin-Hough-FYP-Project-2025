// frontend/src/app/components/admin/user-management/user-role-dialog/user-role-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AuthUser } from '../../../../../services/auth.service';

interface DialogData {
  user: AuthUser;
  currentUserId: string;
}

@Component({
  selector: 'app-user-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-medium mb-4">Edit User Role</h2>

      <div class="mb-4">
        <p><strong>User:</strong> {{ data.user.displayName }} ({{ data.user.email }})</p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <mat-form-field appearance="outline" class="w-full">
          <mat-select [(ngModel)]="selectedRole">
            <mat-option value="USER">User</mat-option>
            <mat-option value="MANAGER">Manager</mat-option>
            <mat-option value="ADMIN">Admin</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="mb-6">
        <mat-checkbox
          [(ngModel)]="isAdmin"
          [disabled]="isSelf"
        >
          Admin Access
        </mat-checkbox>
        <p *ngIf="isSelf" class="text-sm text-amber-600 mt-1">
          You cannot remove your own admin privileges
        </p>
      </div>

      <div class="flex justify-end gap-2">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()">Save</button>
      </div>
    </div>
  `
})
export class UserRoleDialogComponent {
  selectedRole: string;
  isAdmin: boolean;
  isSelf: boolean;

  constructor(
    public dialogRef: MatDialogRef<UserRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.selectedRole = data.user.role || 'USER';
    this.isAdmin = data.user.isAdmin || false;
    this.isSelf = data.user.uid === data.currentUserId;

    // Don't allow removing admin from self
    if (this.isSelf && this.isAdmin) {
      this.isAdmin = true;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      role: this.selectedRole,
      isAdmin: this.isAdmin
    });
  }
}
