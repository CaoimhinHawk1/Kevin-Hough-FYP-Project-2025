// frontend/src/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    console.log('AuthGuard: Checking authentication status...');

    return this.authService.isAuthenticated().pipe(
      take(1),
      tap(isAuthenticated => {
        console.log('AuthGuard: Authentication status:', isAuthenticated);
      }),
      map(isAuthenticated => {
        if (isAuthenticated) {
          console.log('AuthGuard: User is authenticated, allowing access to protected route');
          return true;
        } else {
          console.log('AuthGuard: User is not authenticated, redirecting to login page');
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
