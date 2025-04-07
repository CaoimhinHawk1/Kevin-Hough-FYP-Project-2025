import { Component } from '@angular/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import firebase from 'firebase/compat/app';
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    AsyncPipe
  ],
  standalone: true,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(public auth: AngularFireAuth) { }

  login() {

    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  logout() {
    this.auth.signOut();
  }
}
