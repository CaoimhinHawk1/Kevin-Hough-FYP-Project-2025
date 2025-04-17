// frontend/src/app/app.routes.ts
import { Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { AuthGuard } from "../guards/auth.guard";
import { UserManagementComponent } from "./components/admin/user-management/user-management.component";
import {TaskDashboardComponent} from "./components/task-dashboard/task-dashboard.component";
import { AdminGuard } from "../guards/admin.guard";

export const routes: Routes = [
  // Home is accessible to everyone
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", component: HomeComponent },

  // Auth routes
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },

  // Protected routes - lazy loaded
  {
    path: "job-dashboard",
    loadComponent: () => import('./components/job-dashboard/job-dashboard.component')
      .then(m => m.JobDashboardComponent),
    canActivate: [AuthGuard]
  },

  // Inventory Dashboard
  {
    path: "inventory",
    loadComponent: () => import('./components/inventory/inventory-dashboard.component')
      .then(m => m.InventoryDashboardComponent),
    canActivate: [AuthGuard]
  },

  {
    path: "admin",
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: "", redirectTo: "users", pathMatch: "full" },
      { path: "users", component: UserManagementComponent }
    ]
  },

  {
    path: "tasks",
    component: TaskDashboardComponent,
    canActivate: [AuthGuard]
  },


  // Handle wildcard route - page not found
  { path: "**", redirectTo: "/home" }
];
