import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import Overview from './components/overview/overview.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: Overview }
];
