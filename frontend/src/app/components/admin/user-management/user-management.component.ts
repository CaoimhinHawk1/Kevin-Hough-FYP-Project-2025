// frontend/src/app/components/admin/user-management/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { AuthService, AuthUser } from '../../../../services/auth.service';
import { UserRoleDialogComponent } from './user-role-dialog/user-role-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSelectModule,
    MatSnackBarModule,
    UserRoleDialogComponent
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">User Management</h1>

      <!-- Loading indicator -->
      <div *ngIf="loading" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6750A4]"></div>
      </div>

      <!-- Error message -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
        <button
          (click)="loadUsers()"
          class="ml-2 bg-red-600 text-white py-1 px-2 rounded text-xs"
        >
          Retry
        </button>
      </div>

      <!-- User table -->
      <div *ngIf="!loading && !error" class="overflow-x-auto">
        <table mat-table [dataSource]="users" class="w-full mb-4">
          <!-- User ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let user" class="truncate max-w-[150px]">{{ user.id }}</td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let user">{{ user.name }}</td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <!-- Role Column -->
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let user">
              <span
                [ngClass]="{
                  'bg-purple-100 text-purple-800': user.role === 'ADMIN',
                  'bg-blue-100 text-blue-800': user.role === 'MANAGER',
                  'bg-gray-100 text-gray-800': user.role === 'USER'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ user.role }}
              </span>
            </td>
          </ng-container>

          <!-- Admin Column -->
          <ng-container matColumnDef="isAdmin">
            <th mat-header-cell *matHeaderCellDef>Admin</th>
            <td mat-cell *matCellDef="let user">
              <span *ngIf="user.isAdmin" class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Yes
              </span>
              <span *ngIf="!user.isAdmin" class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                No
              </span>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              <button
                mat-icon-button
                color="primary"
                (click)="openRoleDialog(user)"
                matTooltip="Edit User Role"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                (click)="confirmDeleteUser(user)"
                matTooltip="Delete User"
                [disabled]="user.id === currentUserId"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && !error && users.length === 0" class="text-center py-8">
        <p class="text-gray-500">No users found</p>
      </div>
    </div>
  `,
  styles: [`
    .mat-column-actions {
      width: 100px;
      text-align: center;
    }

    .mat-column-id {
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: AuthUser[] = [];
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'isAdmin', 'actions'];
  loading = false;
  error = '';
  currentUserId = '';

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Get current user ID to prevent self-deletion
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.uid;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
      }
    });
  }

  openRoleDialog(user: AuthUser): void {
    const dialogRef = this.dialog.open(UserRoleDialogComponent, {
      width: '400px',
      data: {
        user: user,
        currentUserId: this.currentUserId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUserRole(user.uid, result.role, result.isAdmin);
      }
    });
  }

  updateUserRole(userId: string, role: string, isAdmin: boolean): void {
    this.loading = true;

    this.authService.updateUserRole(userId, role, isAdmin).subscribe({
      next: (response) => {
        // Update user in the list
        const index = this.users.findIndex(u => u.uid === userId);
        if (index !== -1) {
          this.users[index].role = role;
          this.users[index].isAdmin = isAdmin;
        }

        this.snackBar.open('User role updated successfully', 'Close', {
          duration: 3000
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.snackBar.open('Failed to update user role', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });

        this.loading = false;
      }
    });
  }

  confirmDeleteUser(user: AuthUser): void {
    // Prevent self-deletion
    if (user.uid === this.currentUserId) {
      this.snackBar.open('You cannot delete your own account', 'Close', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    // Show confirmation dialog
    if (confirm(`Are you sure you want to delete user ${user.email}?\nThis action cannot be undone.`)) {
      this.deleteUser(user.uid);
    }
  }

  deleteUser(userId: string): void {
    this.loading = true;

    this.authService.deleteUser(userId).subscribe({
      next: () => {
        // Remove user from the list
        this.users = this.users.filter(u => u.uid !== userId);

        this.snackBar.open('User deleted successfully', 'Close', {
          duration: 3000
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.snackBar.open('Failed to delete user', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });

        this.loading = false;
      }
    });
  }
}
