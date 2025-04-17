// frontend/src/app/components/shared/sidebar/sidebar.component.ts
import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../services/auth.service';
import {filter} from "rxjs/operators";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-white border-r border-black/10 overflow-y-auto">
      <!-- Sidebar Header -->
      <div class="p-4 border-b border-black/10">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-[#6750A4] rounded-full flex items-center justify-center text-white font-bold">
            M
          </div>
          <span class="font-inter text-lg font-semibold">Marq'D</span>
        </div>
      </div>

      <!-- Navigation Sections -->
      <div class="flex-1 py-4">
        <!-- Dashboards Section -->
        <div class="mb-6">
          <div class="px-4 py-1 text-black/40 font-inter text-sm">
            Dashboards
          </div>
          <nav>
            <a routerLink="/job-dashboard"
               class="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
               [class.bg-purple-50]="isActive('/job-dashboard')"
               [class.text-purple-700]="isActive('/job-dashboard')"
               [class.border-r-4]="isActive('/job-dashboard')"
               [class.border-purple-700]="isActive('/job-dashboard')"
            >
              <mat-icon class="text-gray-600">dashboard</mat-icon>
              <span>Dashboard</span>
            </a>

            <a routerLink="/inventory"
               class="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
               [class.bg-purple-50]="isActive('/inventory')"
               [class.text-purple-700]="isActive('/inventory')"
               [class.border-r-4]="isActive('/inventory')"
               [class.border-purple-700]="isActive('/inventory')"
            >
              <mat-icon class="text-gray-600">inventory</mat-icon>
              <span>Inventory Management</span>
            </a>
          </nav>
          <nav>
            <a
              routerLink="/tasks"
              class="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              [class.bg-purple-50]="isActive('/tasks')"
              [class.text-purple-700]="isActive('/tasks')"
              [class.border-r-4]="isActive('/tasks')"
              [class.border-purple-700]="isActive('/tasks')"
            >
              <mat-icon class="mr-3 text-current">task</mat-icon>
              <span>Task Management</span>
            </a>
          </nav>
        </div>

        <!-- Settings Section -->
        <div>
          <div class="px-4 py-1 text-black/40 font-inter text-sm">
            Settings
          </div>
          <nav>
            <a routerLink="/profile"
               routerLinkActive="bg-gray-100"
               class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
              <mat-icon class="text-gray-600">person</mat-icon>
              <span>Profile</span>
            </a>

            <a routerLink="/settings"
               routerLinkActive="bg-gray-100"
               class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
              <mat-icon class="text-gray-600">settings</mat-icon>
              <span>Settings</span>
            </a>

            <button (click)="logout()"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-left">
              <mat-icon class="text-gray-600">logout</mat-icon>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }

    .bg-gray-100 {
      background-color: #f3f4f6;
      font-weight: 500;
    }
  `]
})
export class SidebarComponent implements OnInit {
  currentUser: any;
  currentUrl: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Get current authenticated user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    // Track current URL for active states
    this.currentUrl = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
    });
  }

  isActive(route: string): boolean {
    return this.currentUrl.startsWith(route);
  }

  getUserInitials(): string {
    if (!this.currentUser || !this.currentUser.displayName) {
      return 'U';
    }

    const names = this.currentUser.displayName.split(' ');
    if (names.length === 1) {
      return names[0][0].toUpperCase();
    }

    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigate(['/login']);
      }
    });
  }
}
