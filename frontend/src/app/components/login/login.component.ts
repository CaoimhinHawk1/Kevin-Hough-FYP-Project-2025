// frontend/src/app/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-4 bg-gray-50">
      <mat-card class="w-full max-w-md p-6">
        <mat-card-header class="justify-center mb-4">
          <mat-card-title class="text-2xl font-bold text-center">Login</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Alert message for errors -->
          <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {{ errorMessage }}
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="w-full mb-4">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email" required>
              <mat-error *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full mb-4">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" placeholder="Enter your password" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="mb-4 text-right">
              <a (click)="forgotPassword()" class="text-[#6750A4] cursor-pointer text-sm">
                Forgot Password?
              </a>
            </div>

            <button
              mat-raised-button
              color="primary"
              class="w-full mb-4"
              type="submit"
              [disabled]="loading || loginForm.invalid"
            >
              <span *ngIf="!loading">Login</span>
              <mat-spinner *ngIf="loading" diameter="24" class="m-auto"></mat-spinner>
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center my-4">
            <div class="flex-1 border-t border-gray-300"></div>
            <div class="px-3 text-sm text-gray-500">OR</div>
            <div class="flex-1 border-t border-gray-300"></div>
          </div>

          <!-- Google Login Button -->
          <button
            mat-stroked-button
            class="w-full mb-4 flex items-center justify-center gap-2"
            (click)="loginWithGoogle()"
            [disabled]="loading"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="h-5 w-5" />
            <span>Sign in with Google</span>
          </button>

          <!-- Register Link -->
          <div class="text-center mt-4">
            <span class="text-sm">Don't have an account? </span>
            <a routerLink="/register" class="text-[#6750A4] cursor-pointer text-sm">
              Register
            </a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-form-field {
      width: 100%;
    }

    .mat-mdc-card {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Check if already logged in
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      console.log('LoginComponent: Authentication check result:', isAuthenticated);
      if (isAuthenticated) {
        console.log('LoginComponent: User already authenticated, redirecting to job dashboard');
        this.router.navigate(['/job-dashboard']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.loading = false;
        // Explicitly navigate to job dashboard after successful login
        this.router.navigate(['/job-dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  forgotPassword(): void {
    const email = this.loginForm.get('email')?.value;

    if (!email) {
      this.errorMessage = 'Please enter your email address to reset your password';
      return;
    }

    this.loading = true;
    this.authService.resetPassword(email).subscribe({
      next: () => {
        this.loading = false;
        alert('Password reset email sent. Please check your inbox.');
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to send reset email.';
      }
    });
  }

  loginWithGoogle(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.loading = false;
        // Explicitly navigate to job dashboard after successful Google login
        this.router.navigate(['/job-dashboard']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Google login error:', error);
        this.errorMessage = error.message || 'Failed to sign in with Google. Please try again.';
      }
    });
  }
}
