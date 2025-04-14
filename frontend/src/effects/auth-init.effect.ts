import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { filter, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthInitializationEffect {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    // Check authentication state when the app first loads
    this.afAuth.authState.pipe(
      take(1), // Take only the first emission
      filter(user => !!user) // Filter for authenticated users only
    ).subscribe(user => {
      console.log('User is already authenticated:', user?.displayName);

      // If the user is on the home page and is already authenticated, redirect to job dashboard
      if (this.router.url === '/home' || this.router.url === '/') {
        this.router.navigate(['/job-dashboard']);
      }
    });
  }
}
