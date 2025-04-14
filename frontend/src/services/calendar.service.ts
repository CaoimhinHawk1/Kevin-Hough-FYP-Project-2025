/** TODO: Fix this stuff
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Event } from '../model/event.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly apiUrl = '/api/events';

  // Sample events for demo (remove when backend is ready)
  private sampleEvents: Event[] = [
    {
      id: '1',
      name: 'Client meeting',
      date: new Date(2025, 3, 8), // April 8, 2025
      startTime: '09:00',
      endTime: '10:30',
      description: 'Discuss project requirements',
      location: 'Office Room 101',
      color: '#4285f4',
      isAllDay: false,
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Team standup',
      date: new Date(2025, 3, 8), // April 8, 2025
      startTime: '11:00',
      endTime: '11:30',
      description: 'Daily team progress update',
      location: 'Conference Room A',
      color: '#0f9d58',
      isAllDay: false,
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'Project deadline',
      date: new Date(2025, 3, 10), // April 10, 2025
      startTime: '14:00',
      endTime: '15:00',
      description: 'Submit final deliverables',
      location: '',
      color: '#db4437',
      isAllDay: false,
      createdAt: new Date()
    },
    {
      id: '4',
      name: 'Website maintenance',
      date: new Date(2025, 3, 12), // April 12, 2025
      startTime: '00:00',
      endTime: '23:59',
      description: 'Scheduled system maintenance',
      location: 'Remote',
      color: '#f4b400',
      isAllDay: true,
      createdAt: new Date()
    }
  ];

  constructor(private http: HttpClient) {}

  // Get all events
  getAllEvents(): Observable<Event[]> {
    // When backend is ready, use this:
    // return this.http.get<Event[]>(this.apiUrl);

    // For demo, use sample events
    return of(this.sampleEvents);
  }

  // Get events for a specific date
  getEventsByDate(date: Date): Observable<Event[]> {
    // When backend is ready, use this:
    // const formattedDate = this.formatDateForApi(date);
    // return this.http.get<Event[]>(`${this.apiUrl}/date/${formattedDate}`);

    // For demo, use sample events
    return of(this.sampleEvents.filter(event =>
      event.date.getFullYear() === date.getFullYear() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getDate() === date.getDate()
    ));
  }

  // Get events for a specific month
  getEventsByMonth(year: number, month: number): Observable<Event[]> {
    // When backend is ready, use this:
    // return this.http.get<Event[]>(`${this.apiUrl}/month/${year}/${month + 1}`);

    // For demo, use sample events
    return of(this.sampleEvents.filter(event =>
      event.date.getFullYear() === year &&
      event.date.getMonth() === month
    ));
  }

  // Create a new event
  createEvent(event: Partial<Event>): Observable<Event> {
    // When backend is ready, use this:
    // return this.http.post<Event>(this.apiUrl, event);

    // For demo, add to sample events
    const newEvent: Event = {
      id: Math.random().toString(36).substring(2, 9),
      name: event.name || '',
      date: event.date || new Date(),
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '10:00',
      description: event.description,
      location: event.location,
      color: event.color || '#4285f4',
      isAllDay: event.isAllDay || false,
      createdAt: new Date()
    };

    this.sampleEvents.push(newEvent);
    return of(newEvent);
  }

  // Update an existing event
  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    // When backend is ready, use this:
    // return this.http.put<Event>(`${this.apiUrl}/${id}`, event);

    // For demo, update sample events
    const index = this.sampleEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      this.sampleEvents[index] = { ...this.sampleEvents[index], ...event };
      return of(this.sampleEvents[index]);
    }
    return of(null as any);
  }

  // Delete an event
  deleteEvent(id: string): Observable<boolean> {
    // When backend is ready, use this:
    // return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
    //   map(() => true),
    //   catchError(() => of(false))
    // );

    // For demo, remove from sample events
    const index = this.sampleEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      this.sampleEvents.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // Helper method to format date for API
  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
*/
