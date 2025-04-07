import { Component } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card class="login-card">
      <mat-card-header>
        <mat-card-title>Login</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <button mat-raised-button color="primary" (click)="login()">
          Login with Okta
        </button>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .login-card {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  constructor(private oktaAuth: OktaAuth) {}

  async login() {
    await this.oktaAuth.signInWithRedirect();
  }
}
