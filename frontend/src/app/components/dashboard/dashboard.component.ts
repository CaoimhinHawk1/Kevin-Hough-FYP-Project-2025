// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NavigationService } from '../../../services/navigation.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    imports: [CommonModule, FormsModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  events: any[] = [];
  newTaskTitle = '';
  tasks: any[] = [];

  constructor(
    private apiService: ApiService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.navigationService.setDashboardPage(true);
    this.apiService.getEvents().subscribe({
      next: (data) => this.events = data,
      error: (error) => console.error('Error fetching events:', error)
    });
  }

  ngOnDestroy() {
    this.navigationService.setDashboardPage(false);
  }
}
