// src/app/components/job-dashboard/job-dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { JobDashboardComponent } from './job-dashboard.component';
import { JobCalendarComponent } from './job-calendar/job-calendar.component';
import { JobModalComponent } from './job-modal/job-model.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    RouterModule.forChild([
      { path: '', component: JobDashboardComponent }
    ]),
    // Declare the standalone components as imports
    JobDashboardComponent,
    JobCalendarComponent,
    JobModalComponent
  ],
  // No need to declare standalone components
  declarations: [],
  exports: [JobDashboardComponent]
})
export class JobDashboardModule { }
