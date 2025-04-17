// frontend/src/app/components/shared/dashboard-layout/dashboard-layout.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, MatButtonModule, MatIconModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50">
      <!-- Mobile Navigation Header - Only visible on small screens -->
      <div class="md:hidden flex justify-between items-center px-4 py-3 border-b border-black/10 sticky top-0 z-20 bg-white w-full">
        <div class="font-inter text-lg font-semibold">{{ pageTitle }}</div>
        <button class="p-2" (click)="toggleMobileMenu()">
          <mat-icon>{{ mobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>

      <!-- Mobile Sidebar Overlay - Only appears when menu is open -->
      <div *ngIf="mobileMenuOpen" class="md:hidden fixed inset-0 bg-black/50 z-30" (click)="toggleMobileMenu()"></div>

      <!-- Mobile Sidebar - Completely separate for mobile -->
      <div *ngIf="mobileMenuOpen" class="md:hidden fixed top-0 left-0 z-40 w-[240px] h-full bg-white shadow-lg">
        <app-sidebar></app-sidebar>
      </div>

      <!-- Desktop Sidebar -->
      <div class="hidden md:block md:w-60 border-r border-black/10 overflow-hidden">
        <app-sidebar></app-sidebar>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Content -->
        <div class="flex-1 overflow-y-auto pt-0 md:pt-6 px-4 md:px-6">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardLayoutComponent {
  @Input() pageTitle: string = 'Dashboard';
  mobileMenuOpen: boolean = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
