import { Routes } from "@angular/router";
import { JobDashboardComponent } from "./components/job-dashboard/job-dashboard.component";
import { HomeComponent } from "./components/home/home.component";

import { LoginComponent } from "./components/login/login.component";
import { FirebaseAuthGuard } from "../guards/firebase-auth.guard";

export const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "home", component: HomeComponent },
  {
    path: "job-dashboard",
    component: JobDashboardComponent,
    canActivate: [FirebaseAuthGuard]
  },
  // Handle wildcard route - page not found
  { path: "**", redirectTo: "/home" }
];
