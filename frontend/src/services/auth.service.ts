// frontend/src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private auth: AngularFireAuth,
    private router: Router
  ) {}

  async login() {
    try {
      await this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      await this.router.navigate(['/job-dashboard']);
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  logout() {
    return this.auth.signOut()
      .then(() => {
        this.router.navigate(['/home']);
      });
  }
}
