// frontend/src/guards/firebase-auth.guard.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      tap(authenticated => {
        if (!authenticated) {
          this.router.navigate(['/login']);
        }
      })
    );
  }

  canActivateAdmin(): Observable<boolean> {
    // This would need to be implemented on the backend
    // For now, just use the isAuthenticated method
    return this.authService.isAuthenticated().pipe(
      map(authenticated => {
        if (!authenticated) {
          this.router.navigate(['/login']);
          return false;
        }

        // Here you would check for admin role from your user object
        // For now, we'll just return true for authenticated users
        return true;
      })
    );
  }
}
