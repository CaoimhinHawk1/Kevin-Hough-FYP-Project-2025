
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
// @ts-ignore
import { PdfViewerModule } from 'ngx-extended-pdf-viewer';

import {DashboardComponent} from "./components/dashboard/dashboard.component";

@Component({
    selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule,FormsModule,CommonModule,DashboardComponent,PdfViewerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'KevinFYPProject2025';
}
