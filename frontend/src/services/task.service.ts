// frontend/src/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment/environment';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'marquee' | 'toilet' | 'equipment' | 'vehicle' | 'general';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  assignedTo: string[];
  relatedItems?: string[];
  eventName?: string;
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

  constructor(private http: HttpClient) {}

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

    return this.http.get<Task[]>(`${this.apiUrl}${queryParams}`)
      .pipe(
        map(tasks => this.transformTasksFromApi(tasks)),
        catchError(error => {
          console.error('Error fetching tasks:', error);
          return of([] as Task[]);
        })
      );
  }

  /**
   * Get a single task by ID
   */
  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`)
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
    return this.http.post<Task>(this.apiUrl, this.prepareTaskForApi(task))
      .pipe(
        map(task => this.transformTaskFromApi(task)),
        catchError(error => {
          console.error('Error creating task:', error);
          throw error;
        })
      );
  }

  /**
   * Update an existing task
   */
  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, this.prepareTaskForApi(task))
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
    return this.http.delete(`${this.apiUrl}/${id}`)
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
    return this.http.get(`${this.apiUrl}/stats`)
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
    return {
      ...task,
      dueDate: new Date(task.dueDate),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      createdAt: new Date(task.createdAt)
    };
  }

  /**
   * Prepare task data for API submission
   */
  private prepareTaskForApi(task: Partial<Task>): any {
    // Create a new object instead of modifying the input
    const preparedTask: any = { ...task };

    // If we have Date objects, ensure they're properly formatted for API
    if (preparedTask.dueDate instanceof Date) {
      preparedTask.dueDate = preparedTask.dueDate.toISOString();
    }

    if (preparedTask.completedAt instanceof Date) {
      preparedTask.completedAt = preparedTask.completedAt.toISOString();
    }

    return preparedTask;
  }

  /**
   * Search for tasks by keywords
   */
  searchTasks(searchTerm: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?search=${encodeURIComponent(searchTerm)}`)
      .pipe(
        map(tasks => this.transformTasksFromApi(tasks)),
        catchError(error => {
          console.error('Error searching tasks:', error);
          return of([]);
        })
      );
  }

  /**
   * Get tasks by event ID
   */
  getTasksByEvent(eventId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/event/${eventId}`)
      .pipe(
        map(tasks => this.transformTasksFromApi(tasks)),
        catchError(error => {
          console.error(`Error fetching tasks for event ${eventId}:`, error);
          return of([]);
        })
      );
  }

  /**
   * Get tasks by assigned user
   */
  getTasksByUser(userId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map(tasks => this.transformTasksFromApi(tasks)),
        catchError(error => {
          console.error(`Error fetching tasks for user ${userId}:`, error);
          return of([]);
        })
      );
  }

  /**
   * Mark a task as completed
   */
  completeTask(id: string, completedBy: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/complete`, { completedBy })
      .pipe(
        map(task => this.transformTaskFromApi(task)),
        catchError(error => {
          console.error(`Error completing task ${id}:`, error);
          throw error;
        })
      );
  }
}
