// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AsyncPipe, NgIf],
  template: `
    <ng-container *ngIf="authService.getCurrentUser() | async as user; else loginButton">
      <button class="px-3 py-1 bg-gray-100 rounded text-sm">
        {{ user.displayName || 'User' }} ▼
      </button>
      <button (click)="logout()" class="px-3 py-1 ml-2 bg-red-100 rounded text-sm">Logout</button>
    </ng-container>
    <ng-template #loginButton>
      <button (click)="login()" class="px-3 py-1 bg-blue-100 rounded text-sm">Login</button>
    </ng-template>
  `,
  styles: []
})
export class LoginComponent {
  constructor(public authService: AuthService) {}

  login() {
    this.authService.login().then(() => {
      console.log('Login successful, redirecting to dashboard');
    }).catch(error => {
      console.error('Login error:', error);
    });
  }

  logout() {
    this.authService.logout().then(() => {
      console.log('Logout successful, redirecting to home');
    }).catch(error => {
      console.error('Logout error:', error);
    });
  }
}
