// src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is already authenticated and redirect if needed
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        console.log('User is already authenticated, redirecting to job dashboard');
        this.router.navigate(['/job-dashboard']);
      }
    });
  }

  async loginAndRedirect() {
    try {
      await this.authService.loginWithGoogle();
      // You can add code here that will run after successful login
      console.log('Successfully logged in with Google');
    } catch (error) {
      // Handle any errors that occurred during login
      console.error('Error logging in with Google:', error);
    }
  }
}
