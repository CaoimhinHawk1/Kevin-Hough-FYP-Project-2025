// src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

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

  loginAndRedirect() {
    this.authService.login();
  }
}
