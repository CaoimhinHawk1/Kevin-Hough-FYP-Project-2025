import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthGuard {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          // User is logged in, check if email is verified if needed
          if (user.emailVerified) {
            return of(true);
          } else {
            // Email not verified, redirect to verification page
            this.router.navigate(['/verify-email']);
            return of(false);
          }
        } else {
          // User is not logged in, redirect to login
          this.router.navigate(['/home']);
          return of(false);
        }
      }),
      tap(allowed => {
        if (!allowed) {
          console.log('Access denied - User not authenticated');
        }
      })
    );
  }

  canActivateAdmin(): Observable<boolean> {
    return this.afAuth.idTokenResult.pipe(
      take(1),
      map(idTokenResult => {
        // Check if the user has admin claim
        const isAdmin = idTokenResult?.claims?.['admin'] === true;
        if (!isAdmin) {
          this.router.navigate(['/dashboard']);
          console.log('Access denied - Admin privileges required');
        }
        return isAdmin || false;
      })
    );
  }
}
