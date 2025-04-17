// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [
        RouterOutlet,
        HeaderComponent,
        MatButtonModule
    ]
})
export class AppComponent implements OnInit {
  title = 'KevinFYPProject2025';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Initialize auth service (the constructor of AuthService will handle auto-redirect logic)
    // This ensures that the auth state is checked right when the app loads
    console.log('App component initialized, auth service is ready');
  }
}
