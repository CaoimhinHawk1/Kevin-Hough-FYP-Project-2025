// frontend/src/app/components/task-dashboard/task-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskService, Task } from '../../../services/task.service';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { NavigationService } from '../../../services/navigation.service';
import {DashboardLayoutComponent} from "../shared/dashboard-layout/dashboard-layout.component";

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDividerModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    DashboardLayoutComponent
  ],
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.css']
})
export class TaskDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Tasks data
  tasks: Task[] = [];
  filteredTasks: Task[] = [];

  // Filters
  activeTab: 'all' | 'upcoming' | 'today' | 'completed' = 'today';
  taskTypeFilter: string = 'all';
  priorityFilter: string = 'all';
  statusFilter: string = 'all';

  // Stats
  todayTasksCount = 0;
  upcomingTasksCount = 0;
  completedTasksCount = 0;
  overallProgress = 0;
  tasksByCategory: {[key: string]: number} = {};
  tasksByPriority: {[key: string]: number} = {};

  // UI state
  loading = true;

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    // Set dashboard view in navigation service
    this.navigationService.setDashboardPage(true);
    this.loadTasks();
  }

  ngOnDestroy(): void {
    // Reset dashboard view in navigation service
    this.navigationService.setDashboardPage(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count tasks by status
    this.todayTasksCount = this.tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime() && task.status !== 'completed';
    }).length;

    this.upcomingTasksCount = this.tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() > today.getTime() && task.status !== 'completed';
    }).length;

    this.completedTasksCount = this.tasks.filter(task => task.status === 'completed').length;

    // Calculate progress
    this.overallProgress = this.tasks.length > 0
      ? Math.round((this.completedTasksCount / this.tasks.length) * 100)
      : 0;

    // Count tasks by category
    this.tasksByCategory = {
      marquee: this.tasks.filter(task => task.type === 'marquee').length,
      toilet: this.tasks.filter(task => task.type === 'toilet').length,
      equipment: this.tasks.filter(task => task.type === 'equipment').length,
      vehicle: this.tasks.filter(task => task.type === 'vehicle').length,
      general: this.tasks.filter(task => task.type === 'general').length
    };

    // Count tasks by priority
    this.tasksByPriority = {
      urgent: this.tasks.filter(task => task.priority === 'urgent').length,
      high: this.tasks.filter(task => task.priority === 'high').length,
      medium: this.tasks.filter(task => task.priority === 'medium').length,
      low: this.tasks.filter(task => task.priority === 'low').length
    };
  }

  filterTasks(): void {
    // Start with all tasks
    let filtered = [...this.tasks];

    // Apply tab filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch(this.activeTab) {
      case 'today':
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() > today.getTime();
        });
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
    }

    // Apply task type filter
    if (this.taskTypeFilter !== 'all') {
      filtered = filtered.filter(task => task.type === this.taskTypeFilter);
    }

    // Apply priority filter
    if (this.priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === this.priorityFilter);
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === this.statusFilter);
    }

    this.filteredTasks = filtered;
  }

  changeTab(tab: 'all' | 'upcoming' | 'today' | 'completed'): void {
    this.activeTab = tab;
    this.filterTasks();
  }

  updateTaskTypeFilter(type: string): void {
    this.taskTypeFilter = type;
    this.filterTasks();
  }

  updatePriorityFilter(priority: string): void {
    this.priorityFilter = priority;
    this.filterTasks();
  }

  updateStatusFilter(status: string): void {
    this.statusFilter = status;
    this.filterTasks();
  }

  toggleTaskStatus(task: Task, event: Event): void {
    event.stopPropagation(); // Prevent opening the task details

    // Toggle between completed and previous status
    if (task.status === 'completed') {
      // If completed, set back to in_progress
      task.status = 'in_progress';
      task.completedAt = undefined;
      task.completedBy = undefined;
    } else {
      // Mark as completed
      task.status = 'completed';
      task.completedAt = new Date();
      task.completedBy = 'Current User'; // In a real app, get this from authenticated user
    }

    // Update the task in the backend
    this.taskService.updateTask(task.id, task)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // On success, recalculate stats
          this.calculateStats();
          this.filterTasks();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          // Revert the change on error
          task.status = task.status === 'completed' ? 'in_progress' : 'completed';
          task.completedAt = task.status === 'completed' ? new Date() : undefined;
          task.completedBy = task.status === 'completed' ? 'Current User' : undefined;
        }
      });
  }

  openTaskDetails(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      data: { task: { ...task }, isEditing: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'edit') {
        this.openEditTask(task);
      } else if (result && result.action === 'complete') {
        if (task.status !== 'completed') {
          task.status = 'completed';
          task.completedAt = new Date();
          task.completedBy = 'Current User';

          this.taskService.updateTask(task.id, task)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.calculateStats();
                this.filterTasks();
              },
              error: (error) => console.error('Error completing task:', error)
            });
        }
      }
    });
  }

  openEditTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      data: { task: { ...task }, isEditing: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.task) {
        // Update task in the backend
        this.taskService.updateTask(result.task.id, result.task)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updatedTask) => {
              // Update local task array
              const index = this.tasks.findIndex(t => t.id === updatedTask.id);
              if (index !== -1) {
                this.tasks[index] = updatedTask;
                this.calculateStats();
                this.filterTasks();
              }
            },
            error: (error) => console.error('Error updating task:', error)
          });
      }
    });
  }

  openNewTaskDialog(): void {
    const newTask: Partial<Task> = {
      title: '',
      description: '',
      type: 'general',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(),
      assignedTo: [],
      createdAt: new Date()
    };

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      data: { task: newTask, isEditing: true, isNew: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.task) {
        console.log('Task dialog returned with:', result);

        // Show loading indicator
        this.loading = true;

        // Create task in the backend
        this.taskService.createTask(result.task)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (createdTask) => {
              console.log('Task created successfully:', createdTask);

              // Add to local task array
              this.tasks.push(createdTask);
              this.calculateStats();
              this.filterTasks();
              this.loading = false;

              // Show success message
              this.showSnackBar('Task created successfully');
            },
            error: (error) => {
              console.error('Error creating task:', error);
              this.loading = false;

              // Show error message
              this.showSnackBar('Error creating task: ' + (error.message || 'Unknown error'));
            }
          });
      }
    });
  }

// Add a method for displaying feedback to the user
  private showSnackBar(message: string): void {
    // This would typically use Angular Material's MatSnackBar
    // But for a simpler solution, we can use a basic alert for now
    // In a full implementation, you would inject and use MatSnackBar
    console.log('Task feedback:', message);

    // Uncomment this when you have MatSnackBar imported and injected
    /*
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    */
  }

// Also update the loadTasks method to handle errors better
  loadTasks(): void {
    this.loading = true;

    this.taskService.getAllTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          console.log('Tasks loaded successfully:', tasks);
          this.tasks = tasks;
          this.filterTasks();
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.loading = false;
          // Optionally show error message to user
          this.showSnackBar('Failed to load tasks. Please try again.');
        }
      });
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'urgent': return 'priority-urgent';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'delayed': return 'status-delayed';
      default: return '';
    }
  }

  getTaskTypeClass(type: string): string {
    switch (type) {
      case 'marquee': return 'marquee-task';
      case 'toilet': return 'toilet-task';
      case 'equipment': return 'equipment-task';
      case 'vehicle': return 'vehicle-task';
      case 'general': return 'general-task';
      default: return '';
    }
  }

  getTaskTypeIcon(type: string): string {
    switch (type) {
      case 'marquee': return 'business';
      case 'toilet': return 'wc';
      case 'equipment': return 'handyman';
      case 'vehicle': return 'local_shipping';
      case 'general': return 'assignment';
      default: return 'assignment';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  isOverdue(dueDate: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() < today.getTime();
  }
}
