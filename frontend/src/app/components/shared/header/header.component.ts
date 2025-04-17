// frontend/src/app/components/header/header.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { NavigationService } from "../../../../services/navigation.service";
import { Observable } from "rxjs";
import { AuthService, AuthUser } from "../../../../services/auth.service";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatMenuModule, MatIconModule],
  template: `
    <header
      class="fixed top-0 left-0 right-0 z-50 flex overflow-hidden flex-wrap gap-2 items-center p-1 bg-white border-b border-zinc-300"
    >
      <div class="flex gap-6 items-center self-stretch my-auto w-[169px]">
        <img
          src="../../../assets/images/logo1.png"
          class="object-contain self-stretch my-auto rounded-md aspect-[1.34] w-[100px]"
          alt="Logo"
        />
      </div>
      <nav
        *ngIf="isDashboard$ | async"
        class="flex flex-wrap flex-1 shrink gap-2 items-start self-stretch my-auto text-base leading-none whitespace-nowrap basis-0 min-w-60 text-stone-900 max-md:max-w-full"
      >
        <button routerLink="/dashboard" class="gap-2 self-stretch p-2 rounded-lg bg-neutral-100">
          Dashboard
        </button>
        <button class="gap-2 self-stretch p-2 rounded-lg">Settings</button>

        <!-- Admin Link - Only show for admin users -->
        <button
          *ngIf="isAdmin$ | async"
          routerLink="/admin"
          class="gap-2 self-stretch p-2 rounded-lg bg-purple-100 text-purple-800"
        >
          Admin
        </button>
      </nav>
      <div class="flex gap-3 items-center self-stretch my-auto text-base leading-none text-stone-900 w-[178px]">
        <!-- Show login/register when not authenticated -->
        <ng-container *ngIf="!(isAuthenticated$ | async)">
          <button mat-button routerLink="/login">Login</button>
          <button mat-raised-button color="primary" routerLink="/register">Register</button>
        </ng-container>

        <!-- Show user info and logout when authenticated -->
        <ng-container *ngIf="isAuthenticated$ | async">
          <button mat-button [matMenuTriggerFor]="userMenu" class="flex items-center">
            <span class="text-sm mr-2">{{ (currentUser$ | async)?.displayName || 'User' }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>

            <!-- Admin Option -->
            <button mat-menu-item routerLink="/admin/users" *ngIf="isAdmin$ | async">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>User Management</span>
            </button>

            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </ng-container>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 56px;
      }

      header {
        width: 100%;
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  isDashboard$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  currentUser$: Observable<AuthUser | null>;

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private authService: AuthService
  ) {
    this.isDashboard$ = this.navigationService.isDashboardPage$;
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.isAdmin$ = this.authService.isAdmin();
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.navigationService.setDashboardPage(this.router.url === '/dashboard');
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even on error, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }
}
