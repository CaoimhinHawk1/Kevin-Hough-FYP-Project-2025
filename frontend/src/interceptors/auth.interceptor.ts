import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip interceptor for certain routes like login
    if (request.url.includes('/login') || request.url.includes('/register')) {
      return next.handle(request);
    }

    return from(this.getToken()).pipe(
      switchMap(token => {
        // Clone the request and add the authorization header if token exists
        if (token) {
          const authReq = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(authReq);
        }
        
        // No token, proceed with original request
        return next.handle(request);
      }),
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          // Redirect to login page
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private async getToken(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? await user.getIdToken() : null;
  }
}
