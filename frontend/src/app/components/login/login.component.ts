import { Component } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { AsyncPipe, NgIf } from "@angular/common";
import { AuthService } from "../../../services/auth.service

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  imports: [
    AsyncPipe,
    NgIf
  ],
  standalone: true,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(
    public auth: AngularFireAuth,
    private router: Router,
    private authService: AuthService
  ) { }

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(() => {
        this.router.navigate(['/job-dashboard']);
      })
      .catch((error) => {
        console.error('Login error:', error);
      });
  }

  logout() {
    this.auth.signOut()
      .then(() => {
        this.router.navigate(['/']);
      });
  }
}
