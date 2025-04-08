// src/app/app.routes.ts
import { Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { AuthGuard } from "./guards/auth.guard";

export const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "home", component: HomeComponent },
  {
    path: "job-dashboard",
    loadChildren: () => import('./components/job-dashboard/job-dashboard.module')
      .then(m => m.JobDashboardModule),
    canActivate: [AuthGuard] // Protect this route with auth guard
  },
];
