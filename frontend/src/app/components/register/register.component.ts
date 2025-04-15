// frontend/src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-4 bg-gray-50">
      <mat-card class="w-full max-w-md p-6">
        <mat-card-header class="justify-center mb-4">
          <mat-card-title class="text-2xl font-bold text-center">Create Account</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Alert message for errors -->
          <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {{ errorMessage }}
          </div>

          <!-- Registration Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="w-full mb-4">
              <mat-label>Display Name</mat-label>
              <input matInput formControlName="displayName" type="text" placeholder="Enter your name">
              <mat-error *ngIf="registerForm.get('displayName')?.invalid && registerForm.get('displayName')?.touched">
                Display name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full mb-4">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email" required>
              <mat-error *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full mb-4">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" placeholder="Enter your password" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full mb-4">
              <mat-label>Confirm Password</mat-label>
              <input matInput formControlName="confirmPassword" [type]="hidePassword ? 'password' : 'text'" placeholder="Confirm your password" required>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
                <span *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              class="w-full mb-4"
              type="submit"
              [disabled]="loading || registerForm.invalid"
            >
              <span *ngIf="!loading">Register</span>
              <mat-spinner *ngIf="loading" diameter="24" class="m-auto"></mat-spinner>
            </button>
          </form>

          <!-- Login Link -->
          <div class="text-center mt-4">
            <span class="text-sm">Already have an account? </span>
            <a routerLink="/login" class="text-[#6750A4] cursor-pointer text-sm">
              Log in
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      g.get('confirmPassword')?.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password, displayName } = this.registerForm.value;

    this.authService.register(email, password, displayName).subscribe({
      next: (response) => {
        this.loading = false;

        // Show verification message or redirect to verification page
        if (response.user && !response.user.emailVerified) {
          alert('Registration successful! Please check your email to verify your account.');
        }

        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
