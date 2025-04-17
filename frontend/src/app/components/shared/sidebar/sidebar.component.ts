// frontend/src/app/components/shared/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../services/auth.service';

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
               routerLinkActive="bg-gray-100"
               class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
              <mat-icon class="text-gray-600">dashboard</mat-icon>
              <span>Job Dashboard</span>
            </a>

            <a routerLink="/inventory"
               routerLinkActive="bg-gray-100"
               class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
              <mat-icon class="text-gray-600">inventory_2</mat-icon>
              <span>Inventory Management</span>
            </a>
          </nav>
        </div>

        <!-- Resources Section -->
        <div class="mb-6">
          <div class="px-4 py-1 text-black/40 font-inter text-sm">
            Resources
          </div>
          <nav>
            <a routerLink="/customers"
               routerLinkActive="bg-gray-100"
               class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
              <mat-icon class="text-gray-600">people</mat-icon>
              <span>Customers</span>
            </a>

            <a routerLink="/events"
               routerLinkActive="bg-gray-100"
               class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
              <mat-icon class="text-gray-600">event</mat-icon>
              <span>Events</span>
            </a>

            <a routerLink="/vehicles"
               routerLinkActive="bg-gray-100"
               class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
              <mat-icon class="text-gray-600">local_shipping</mat-icon>
              <span>Vehicles</span>
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
export class SidebarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
