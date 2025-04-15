// frontend/src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from "@angular/router";
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative min-h-[calc(100vh-56px)] overflow-hidden bg-cover bg-center bg-no-repeat" [ngStyle]="{'background-image': 'url(assets/images/img.png)'}">
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="container relative mx-auto px-6 py-32 h-full flex items-center justify-center">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-5xl font-bold mb-8 text-white">Welcome to Marq'D</h1>
          <p class="text-xl mb-12 text-white">Your complete event management solution.</p>

          <!-- Show different buttons based on authentication state -->
          <div class="flex justify-center">
            <button *ngIf="!isAuthenticated"
              (click)="loginAndRedirect()"
              class="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
              Get Started with Job Dashboard
            </button>

            <button *ngIf="isAuthenticated"
              (click)="goToDashboard()"
              class="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is already authenticated
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      console.log('HomeComponent: Authentication status:', isAuthenticated);
      this.isAuthenticated = isAuthenticated;
    });
  }

  loginAndRedirect() {
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/job-dashboard']);
  }
}
