import { Routes } from "@angular/router";
import { JobDashboardComponent } from "./components/job-dashboard/job-dashboard.component";
import { HomeComponent } from "./components/home/home.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { LoginComponent } from "./components/login/login.component";

export const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "home", component: HomeComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "job-dashboard", component: JobDashboardComponent },
];
