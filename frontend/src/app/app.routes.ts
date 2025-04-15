// frontend/src/app/app.routes.ts
import { Routes } from "@angular/router";
import { JobDashboardComponent } from "./components/job-dashboard/job-dashboard.component";
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { AuthGuard } from "../guards/auth.guard";

export const routes: Routes = [
  // Home is accessible to everyone
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", component: HomeComponent },

  // Auth routes
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },

  // Protected route
  {
    path: "job-dashboard",
    component: JobDashboardComponent,
    canActivate: [AuthGuard]
  },

  // Handle wildcard route - page not found
  { path: "**", redirectTo: "/home" }
];
