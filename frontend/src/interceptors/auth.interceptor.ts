// frontend/src/interceptors/auth.interceptor.function.ts
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);

  console.log(`HTTP Interceptor: ${req.method} ${req.url}`);

  // Clone the request and ensure credentials are sent with each request
  // This is needed for cookies to be sent with cross-origin requests
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`HTTP Error (${req.url}):`, error.status, error.message);

      // Handle 401 Unauthorized errors for non-auth endpoints
      if (error.status === 401) {
        // Don't redirect if this is already an auth-related request
        const isAuthRequest = req.url.includes('/auth/');
        if (!isAuthRequest) {
          console.log('Interceptor: Redirecting to login due to 401 error');
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
