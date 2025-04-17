// frontend/src/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    console.log('AdminGuard: Checking if user has admin permissions...');

    return this.authService.isAdmin().pipe(
      take(1),
      map(isAdmin => {
        console.log('AdminGuard: User is admin:', isAdmin);

        if (isAdmin) {
          return true;
        } else {
          console.log('AdminGuard: Access denied, redirecting to dashboard');
          // Redirect to regular dashboard if user is authenticated but not admin
          return this.router.createUrlTree(['/job-dashboard']);
        }
      })
    );
  }
}
