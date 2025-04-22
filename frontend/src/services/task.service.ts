// frontend/src/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environment/environment';
import { AuthService } from './auth.service';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  dueDate: Date;
  assignedUserIds: string[];
  assignedTo?: string[];
  relatedItems?: string[];  // Frontend model has relatedItems
  relatedItemIds?: string[]; // Backend model has relatedItemIds
  location?: string;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(
    private http: HttpClient,
    private authService: AuthService  // Inject AuthService
  ) {
    console.log('TaskService initialized with API URL:', this.apiUrl);
  }

  /**
   * Get all tasks with optional filtering
   */
  getAllTasks(filters?: any): Observable<Task[]> {
    // Build query params from filters if provided
    let queryParams = '';
    if (filters) {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      queryParams = params.toString() ? `?${params.toString()}` : '';
    }

    console.log(`Fetching tasks from: ${this.apiUrl}${queryParams}`);

    return this.http.get<Task[]>(`${this.apiUrl}${queryParams}`, { withCredentials: true })
      .pipe(
        tap(response => console.log('Task API response:', response)),
        map(tasks => this.transformTasksFromApi(tasks)),
        catchError(error => {
          console.error('Error fetching tasks:', error);
          // For development, provide some mock data
          return throwError(error);
        })
      );
  }

  /**
   * Get a single task by ID
   */
  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`, { withCredentials: true })
      .pipe(
        map(task => this.transformTaskFromApi(task)),
        catchError(error => {
          console.error(`Error fetching task ${id}:`, error);
          throw error;
        })
      );
  }

  /**
   * Create a new task
   */
  createTask(task: Partial<Task>): Observable<Task> {
    // First, check if we have an authenticated user
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.uid) {
      console.error('Cannot create task: No authenticated user found');
      return throwError(() => new Error('User authentication required to create a task'));
    }

    const preparedTask = this.prepareTaskForApi(task);

    if (!preparedTask.createdBy) {
      preparedTask.createdBy = {
        connect: {
          id: currentUser.uid
        }
      };
    }

    // Add the current user ID to ensure it's always available for task creation
    // This helps prevent the "Cannot read properties of undefined (reading 'id')" error
    (preparedTask as any).createdBy = currentUser.uid;

    console.log('Creating task with data:', preparedTask);
    console.log('Current user ID:', currentUser.uid);

    // Ensure consistent data format with backend expectations
    return this.http.post<Task>(this.apiUrl, preparedTask, {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
      .pipe(
        tap(response => console.log('Create task response:', response)),
        map(task => this.transformTaskFromApi(task)),
        catchError(error => {
          console.error('Error creating task:', error);
          console.log('Request payload that failed:', preparedTask);
          console.log('API URL used:', this.apiUrl);

          // Try to extract more detailed error information
          let errorMsg = 'Failed to create task';
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.message) {
            errorMsg = error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorMsg = error.error;
          }

          throw new Error(errorMsg);
        })
      );
  }

  /**
   * Update an existing task
   */
  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    const preparedTask = this.prepareTaskForApi(task);
    console.log(`Updating task ${id} with data:`, preparedTask);

    return this.http.put<Task>(`${this.apiUrl}/${id}`, preparedTask, { withCredentials: true })
      .pipe(
        map(task => this.transformTaskFromApi(task)),
        catchError(error => {
          console.error(`Error updating task ${id}:`, error);
          throw error;
        })
      );
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error(`Error deleting task ${id}:`, error);
          throw error;
        })
      );
  }

  /**
   * Get task statistics
   */
  getTaskStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Error fetching task stats:', error);
          throw error;
        })
      );
  }

  /**
   * Transform tasks from API format to client format
   */
  private transformTasksFromApi(tasks: any[]): Task[] {
    return tasks.map(task => this.transformTaskFromApi(task));
  }

  /**
   * Transform a single task from API format to client format
   */
  private transformTaskFromApi(task: any): Task {
    // Convert from backend model to frontend model
    const transformedTask: Task = {
      ...task,
      dueDate: new Date(task.dueDate),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
    };

    // Map relatedItemIds from backend to relatedItems for frontend if needed
    if (task.relatedItemIds && !task.relatedItems) {
      transformedTask.relatedItems = task.relatedItemIds;
    }

    return transformedTask;
  }

  /**
   * Prepare task data for API submission
   */
  private prepareTaskForApi(task: Partial<Task>): any {
    // Create a new object instead of modifying the input
    const preparedTask: any = { ...task };

    // FIX #1: Map relatedItems to relatedItemIds for the backend
    if (task.relatedItems) {
      preparedTask.relatedItemIds = task.relatedItems;
      delete preparedTask.relatedItems;
    }

    // FIX #2: Remove the assignedTo field as the backend doesn't expect it directly
    // The assignedUsers field is already handled through the assignedUserIds mechanism
    if (preparedTask.assignedTo) {
      delete preparedTask.assignedTo;
    }

    if (preparedTask.createdBy) {
      preparedTask.createdBy = {
        connect: {
          id: preparedTask.createdBy
        }
      };
      delete preparedTask.createdBy;
    }

    if ((task as any).assignedUserIds) {
      preparedTask.assignedUserIds = (task as any).assignedUserIds.filter((id: null | undefined) => id !== undefined && id !== null);
    }

    // If we have Date objects, ensure they're properly formatted for API
    if (preparedTask.dueDate instanceof Date) {
      preparedTask.dueDate = preparedTask.dueDate.toISOString();
    }

    if (preparedTask.completedAt instanceof Date) {
      preparedTask.completedAt = preparedTask.completedAt.toISOString();
    }

    // Make sure status and type are uppercase for the backend
    if (preparedTask.status) {
      preparedTask.status = preparedTask.status.toUpperCase();
    }

    if (preparedTask.type) {
      preparedTask.type = preparedTask.type.toUpperCase();
    }

    if (preparedTask.priority) {
      preparedTask.priority = preparedTask.priority.toUpperCase();
    }

    return preparedTask;
  }

  // /**
  //  * Provide mock data for development if the backend is not available
  //  */
  // private provideMockTasksData(): Observable<Task[]> {
  //   console.warn('Using mock task data as fallback');
  //
  //   const today = new Date();
  //   const tomorrow = new Date();
  //   tomorrow.setDate(today.getDate() + 1);
  //
  //   const mockTasks: Task[] = [
  //     {
  //       id: '1',
  //       title: 'Set up marquee for event',
  //       description: 'Set up the 40x60 marquee for the Johnson wedding',
  //       type: 'marquee',
  //       status: 'pending',
  //       priority: 'high',
  //       dueDate: tomorrow,
  //       assignedTo: ['John Doe', 'Jane Smith'],
  //       location: 'Central Park',
  //       notes: 'Ensure proper anchoring due to weather forecast',
  //       createdAt: today
  //     },
  //     {
  //       id: '2',
  //       title: 'Maintain portable toilets',
  //       description: 'Regular maintenance for the portable toilets at the festival',
  //       type: 'toilet',
  //       status: 'in_progress',
  //       priority: 'medium',
  //       dueDate: today,
  //       assignedTo: ['Mike Brown'],
  //       location: 'Downtown',
  //       createdAt: new Date(today.getTime() - 86400000) // Yesterday
  //     }
  //   ];
  //
  //   return of(mockTasks);
  // }
}
