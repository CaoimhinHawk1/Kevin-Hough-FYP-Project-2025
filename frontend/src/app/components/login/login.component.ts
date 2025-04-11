import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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

          <mat-divider class="my-4"></mat-divider>

          <!-- Google Login Button -->
          <button
            mat-stroked-button
            class="w-full mb-4"
            (click)="loginWithGoogle()"
            [disabled]="loading"
          >
            <img src="assets/images/google-logo.png" alt="Google" class="h-5 w-5 mr-2">
            Login with Google
          </button>

          <!-- Register Link -->
          <div class="text-center">
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
    public auth: AuthService,
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
    this.auth.isLoggedIn().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, password } = this.loginForm.value;
      await this.auth.loginWithEmailPassword(email, password);
      // Navigation is handled in the auth service
    } catch (error: any) {
      console.error('Login error:', error);
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.auth.loginWithGoogle();
      // Navigation is handled in the auth service
    } catch (error: any) {
      console.error('Google login error:', error);
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async forgotPassword(): Promise<void> {
    const email = this.loginForm.get('email')?.value;

    if (!email) {
      this.errorMessage = 'Please enter your email address to reset your password';
      return;
    }

    try {
      await this.auth.resetPassword(email);
      alert('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      this.errorMessage = this.getErrorMessage(error);
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'auth/user-not-found') {
      return 'No account found with this email address';
    } else if (error.code === 'auth/wrong-password') {
      return 'Invalid password';
    } else if (error.code === 'auth/invalid-email') {
      return 'Invalid email format';
    } else if (error.code === 'auth/user-disabled') {
      return 'This account has been disabled';
    } else if (error.code === 'auth/too-many-requests') {
      return 'Too many failed login attempts. Please try again later or reset your password';
    }

    return error.message || 'An unexpected error occurred';
  }
}
