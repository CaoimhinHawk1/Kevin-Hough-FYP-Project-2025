import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NavigationService } from "../../../services/navigation.service";
import { ApiService } from "../../../services/api.service";
import { MatDialog } from "@angular/material/dialog";
import { JobModalComponent } from "./job-modal/job-model.component";
import { Subject, takeUntil } from "rxjs";
import {JobCalendarComponent} from "./job-calendar/job-calendar.component";
import { AuthService } from "../../../services/auth.service";
import {DashboardLayoutComponent} from "../shared/dashboard-layout/dashboard-layout.component";
import { TaskService, Task } from '../../../services/task.service';
import { Router } from '@angular/router';

interface JobListing {
  id?: string;
  location: string;
  description: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  date?: Date;
  status?: string;
}

interface JobModal {
  title: string;
  location: string;
  description: string;
  date: string;
  status: string;
  assignedTo: string[];
  equipment: string[];
}

interface Marquee {
  id?: string;
  size: string;
  checked: boolean;
  assigned?: boolean;
}

interface Vehicle {
  id?: string;
  initial: string;
  name: string;
  available?: boolean;
}

@Component({
  selector: "app-job-dashboard",
  templateUrl: "./job-dashboard.component.html",
  styleUrls: ["./job-dashboard.component.css"],
  imports: [CommonModule, FormsModule, JobCalendarComponent, DashboardLayoutComponent],
  standalone: true
})
export class JobDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  weeklyTasks: Task[] = [];
  loadingTasks = false;
  taskError = '';
  searchQuery: string = "";
  activeView: "weekly" | "monthly" = "weekly";
  vehicleView: "today" | "weekly" = "today";
  selectedDay: string = "Monday";
  screenWidth: number = window.innerWidth;
  loading: boolean = false;
  error: string = "";
  mobileMenuOpen: boolean = false;

  days: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  jobListings: JobListing[] = [];
  marquees: Marquee[] = [];
  vehicles: Vehicle[] = [];

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
  }

  constructor(
    private navigationService: NavigationService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router
) {}

  ngOnInit(): void {
    this.navigationService.setDashboardPage(true);
    this.loadData();

    // Check authentication
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      console.log('JobDashboardComponent: Authentication check result:', isAuthenticated);
      // No need to redirect, the AuthGuard will handle that
    });
  }

  ngOnDestroy(): void {
    this.navigationService.setDashboardPage(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;

    // Load events (job listings)
    this.apiService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('API response:', response);

          const events = Array.isArray(response) ? response :
            response?.data ? (Array.isArray(response.data) ? response.data : []) :
              [];

          this.jobListings = events.map((event: any) => {
            const date = new Date(event.date);
            const dayOfWeek = date.getDay();
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


            return {
              id: event.id,
              location: event.location || 'Unknown Location',
              description: event.description || 'No description',
              day: days[dayOfWeek] as any,
              date: date,
              status: event.status || 'Pending'
            };
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading events:', err);
          this.error = 'Failed to load job listings. Please try again later.';
          this.loading = false;

          // Fallback to mock data for development
          this.loadMockData();
        }
      });

    // Load items (for marquees)
    this.apiService.getItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.marquees = items
            .filter((item: any) => item.type === 'marquee')
            .map((item: any) => ({
              id: item.id,
              size: item.name,
              checked: true,
              assigned: item.assigned || false
            }));
        },
        error: (err) => {
          console.error('Error loading items:', err);
          // Fallback to mock marquee data
          this.marquees = [
            { size: "40x50", checked: true, assigned: false },
            { size: "50x120", checked: true, assigned: true },
            { size: "20x20", checked: true, assigned: false },
            { size: "20x20", checked: true, assigned: true },
            { size: "40x60", checked: true, assigned: false },
            { size: "30x80", checked: true, assigned: true },
          ];
        }
      });

    // Load vehicles
    // In a real app, you might have a dedicated vehicles endpoint
    // For now, we're using mock data
    this.vehicles = [
      { initial: "A", name: "TOYOTA LANDCRUISER 12-L-4567", available: true },
      { initial: "A", name: "TOYOTA LANDCRUISER 08-C-854", available: false },
      { initial: "A", name: "TOYOTA LANDCRUISER 10-L-92", available: true },
      { initial: "A", name: "TOYOTA HILUX 171-L-685", available: true },
    ];
  }

  // Fallback to mock data for development
  loadMockData(): void {
    this.jobListings = [
      { location: "Co. Cork", description: "20x50, 30x...", day: "Monday" },
      { location: "Co. Cork", description: "40x80", day: "Monday" },
      { location: "Co. Limerick", description: "6 Portaloos", day: "Tuesday" },
      { location: "Co. Limerick", description: "30x60", day: "Wednesday" },
      { location: "Co. Clare", description: "3m Pagoda", day: "Thursday" },
      { location: "Co. Cork", description: "20x50, 30x...", day: "Thursday" },
      { location: "Co. Cork", description: "40x80", day: "Friday" },
      { location: "Co. Limerick", description: "30x60", day: "Friday" },
      { location: "Co. Clare", description: "3m Pagoda", day: "Friday" },
    ];
  }

  setActiveView(view: "weekly" | "monthly"): void {
    this.activeView = view;
  }

  setVehicleView(view: "today" | "weekly"): void {
    this.vehicleView = view;
  }

  getJobsForDay(day: string): JobListing[] {
    return this.jobListings.filter((job) => job.day === day);
  }


  showJobDetails(job: JobListing): void {
    const modalData: JobModal = {
      title: `Job at ${job.location}`,
      location: job.location,
      description: job.description,
      date: job.day,
      status: job.status || "Pending",
      assignedTo: ["John Doe", "Jane Smith"],
      equipment: ["20x50 Marquee", "30x60 Marquee", "6 Portaloos"]
    };

    const dialogRef = this.dialog.open(JobModalComponent, {
      data: modalData,
      width: '90%',
      maxWidth: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'edit') {
        // Handle edit action
        console.log('Edit job:', job);
      }
    });
  }

  handleEventSelected(event: any): void {
    console.log('Selected event:', event);

    // Convert event to job format and show details
    const job: JobListing = {
      id: event.id,
      location: event.location || event.name,
      description: event.description || '',
      day: new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' }) as any
    };

    this.showJobDetails(job);
  }

  loadWeeklyTasks(): void {
    this.loadingTasks = true;
    this.taskError = '';

    // Get today's date
    const today = new Date();

    // Get date one week from today
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Create date filter for the next 7 days
    const dateFilter = {
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    };

    this.taskService.getAllTasks(dateFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          // Sort by priority and due date
          this.weeklyTasks = tasks
            .filter(task => task.status !== 'completed')  // Filter out completed tasks
            .sort((a, b) => {
              // First by priority (urgent > high > medium > low)
              const priorityOrder: { [key: string]: number } = { urgent: 0, high: 1, medium: 2, low: 3 };
              const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

              if (priorityDiff !== 0) return priorityDiff;

              // Then by due date (earliest first)
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            })
            .slice(0, 5);  // Limit to 5 tasks for the widget

          this.loadingTasks = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.taskError = 'Failed to load tasks';
          this.loadingTasks = false;
        }
      });
  }

  // Helper method for task priority class
  getTaskPriorityClass(priority: string): string {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  // Helper method for task status class
  getTaskStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'text-yellow-700 border-yellow-300 bg-yellow-50';
      case 'in_progress': return 'text-blue-700 border-blue-300 bg-blue-50';
      case 'completed': return 'text-green-700 border-green-300 bg-green-50';
      case 'delayed': return 'text-red-700 border-red-300 bg-red-50';
      default: return 'text-gray-700 border-gray-300 bg-gray-50';
    }
  }

  // Format task date
  formatTaskDate(date: Date): string {
    const taskDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // Check if date is today
    if (taskDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if date is tomorrow
    if (taskDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Otherwise return formatted date
    return taskDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // Navigate to task details
  viewTaskDetails(task: Task): void {
    this.router.navigate(['/tasks'], { state: { selectedTaskId: task.id } });
  }

  isMobileView(): boolean {
    return this.screenWidth < 768;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  createNewEvent(): void {
    // Logic to open a dialog for creating a new event
    console.log('Creating new event');
    // In a real app, you would open a dialog or navigate to a create form
  }
}
