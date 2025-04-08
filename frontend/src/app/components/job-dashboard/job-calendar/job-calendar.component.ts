// src/app/components/job-dashboard/job-calendar/job-calendar.component.ts
import { Component, Input, OnChanges, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { JobModalComponent} from '../job-modal/job-model.component';
import {DayModalComponent } from '../day-modal/day-modal.component';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: any[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

@Component({
  selector: 'app-job-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="calendar-container bg-white rounded-lg shadow h-full">
      <!-- Calendar Header -->
      <div class="calendar-header flex justify-between items-center p-4 border-b">
        <div class="flex items-center gap-2">
          <button (click)="previousPeriod()" class="p-2 rounded hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h2 class="text-lg font-semibold">{{ getHeaderText() }}</h2>
          <button (click)="nextPeriod()" class="p-2 rounded hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="flex gap-2">
          <button (click)="setToday()" class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">Today</button>
          <button
            (click)="setView('weekly')"
            [class.bg-[#6750A4]]="currentView === 'weekly'"
            [class.text-white]="currentView === 'weekly'"
            class="px-3 py-1 text-sm rounded hover:bg-gray-200">
            Week
          </button>
          <button
            (click)="setView('monthly')"
            [class.bg-[#6750A4]]="currentView === 'monthly'"
            [class.text-white]="currentView === 'monthly'"
            class="px-3 py-1 text-sm rounded hover:bg-gray-200">
            Month
          </button>
        </div>
      </div>

      <!-- Weekly View -->
      <div *ngIf="currentView === 'weekly'" class="weekly-view h-[calc(100%-60px)]">
        <!-- Days of Week Header -->
        <div class="grid grid-cols-7 border-b">
          <div *ngFor="let day of daysOfWeek" class="p-2 text-center text-sm font-medium border-r last:border-r-0">
            {{ day }}
          </div>
        </div>

        <!-- Weekly Calendar Grid -->
        <div class="grid grid-cols-7 h-full">
          <div *ngFor="let day of weekDays"
               class="border-r last:border-r-0 border-b p-2 relative h-full overflow-auto cursor-pointer hover:bg-gray-50"
               [class.bg-blue-50]="day.isToday"
               (click)="showDayModal(day)">
            <div class="flex justify-between items-center mb-2 sticky top-0 bg-inherit pt-1 pb-2">
              <span class="text-sm font-semibold" [class.text-blue-600]="day.isToday">
                {{ day.date.getDate() }}
              </span>
              <span class="text-xs text-gray-500">
                {{ day.date | date:'EEE' }}
              </span>
            </div>

            <!-- Events for day -->
            <div *ngIf="day.events.length > 0" class="space-y-1">
              <div *ngFor="let event of day.events.slice(0, 3)"
                   class="p-1 text-xs bg-indigo-100 rounded truncate cursor-pointer"
                   (click)="selectEvent(event, $event)">
                {{ event.description }}
              </div>
              <div *ngIf="day.events.length > 3" class="text-xs text-gray-500 text-center">
                +{{ day.events.length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly View -->
      <div *ngIf="currentView === 'monthly'" class="monthly-view h-[calc(100%-60px)]">
        <!-- Days of Week Header -->
        <div class="grid grid-cols-7 border-b">
          <div *ngFor="let day of daysOfWeek" class="p-2 text-center text-sm font-medium border-r last:border-r-0">
            {{ day }}
          </div>
        </div>

        <!-- Monthly Calendar Grid -->
        <div class="grid grid-cols-7 h-full" style="grid-template-rows: repeat(6, 1fr);">
          <div *ngFor="let day of monthDays"
               class="border-r last:border-r-0 border-b p-1 relative overflow-hidden cursor-pointer hover:bg-gray-50"
               [class.opacity-40]="!day.isCurrentMonth"
               [class.bg-blue-50]="day.isToday"
               (click)="showDayModal(day)">
            <div class="text-sm font-semibold mb-1" [class.text-blue-600]="day.isToday">
              {{ day.date.getDate() }}
            </div>

            <!-- Dots and mini-events for month view -->
            <div *ngIf="day.events.length > 0" class="flex flex-col gap-1">
              <div *ngFor="let event of day.events.slice(0, 2)"
                   class="text-xs p-1 bg-indigo-100 rounded truncate"
                   (click)="selectEvent(event, $event)">
                {{ event.description }}
              </div>
              <div *ngIf="day.events.length > 2" class="text-xs text-center text-gray-500">
                +{{ day.events.length - 2 }} more
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* Make scrollbar less obtrusive */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  `]
})
export class JobCalendarComponent implements OnInit, OnChanges {
  @Input() view: 'weekly' | 'monthly' = 'weekly';
  @Input() events: any[] = [];
  @Output() eventSelected = new EventEmitter<any>();

  currentView: 'weekly' | 'monthly';
  currentDate: Date = new Date();
  weekDays: CalendarDay[] = [];
  monthDays: CalendarDay[] = [];
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  selectedDay: CalendarDay | null = null;

  constructor(private dialog: MatDialog) {
    this.currentView = this.view;
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['view']) {
      this.currentView = changes['view'].currentValue;
      this.generateCalendar();
    }

    if (changes['events']) {
      this.generateCalendar();
    }
  }

  generateCalendar(): void {
    if (this.currentView === 'weekly') {
      this.generateWeekView();
    } else {
      this.generateMonthView();
    }
  }

  generateWeekView(): void {
    this.weekDays = [];
    const startOfWeek = new Date(this.currentDate);

    // Adjust to start of week (Sunday)
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

    // Create 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      this.weekDays.push({
        date: date,
        isCurrentMonth: date.getMonth() === this.currentDate.getMonth(),
        isToday: this.isToday(date),
        events: this.getEventsForDate(date)
      });
    }
  }

  generateMonthView(): void {
    this.monthDays = [];
    const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    // Start from the first day of the month's week
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    // Generate days for the entire month view (6 weeks to ensure coverage)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      this.monthDays.push({
        date: date,
        isCurrentMonth: date.getMonth() === this.currentDate.getMonth(),
        isToday: this.isToday(date),
        events: this.getEventsForDate(date)
      });

      // Break if we've rendered enough weeks
      if (date.getTime() > lastDayOfMonth.getTime() && date.getDay() === 6) {
        break;
      }
    }
  }

  getEventsForDate(date: Date): any[] {
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate();
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  }

  previousPeriod(): void {
    if (this.currentView === 'weekly') {
      // Move back one week
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      // Move back one month
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.generateCalendar();
    this.selectedDay = null;
  }

  nextPeriod(): void {
    if (this.currentView === 'weekly') {
      // Move forward one week
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      // Move forward one month
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.generateCalendar();
    this.selectedDay = null;
  }

  setToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
    this.selectedDay = null;
  }

  setView(view: 'weekly' | 'monthly'): void {
    this.currentView = view;
    this.generateCalendar();
    this.selectedDay = null;
  }

  /**
   * Shows a modal with all events for a specific day
   */
  showDayModal(day: CalendarDay): void {
    if (day.events.length === 0) {
      // Maybe show an empty day modal or a message
      console.log('No events for this day');

      // Open empty day modal
      this.dialog.open(DayModalComponent, {
        width: '500px',
        data: {
          title: day.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          date: day.date.toISOString().split('T')[0],
          events: [],
          isToday: day.isToday
        }
      });

      return;
    }

    // Open the modal with day information
    const dialogRef = this.dialog.open(DayModalComponent, {
      width: '500px',
      data: {
        title: day.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        date: day.date.toISOString().split('T')[0],
        events: day.events,
        isToday: day.isToday
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Modal result:', result);
        // If an event was selected from the day view, open that event
        if (typeof result === 'object' && !result.action) {
          this.selectEvent(result, new MouseEvent('click'));
        } else if (result.action === 'edit') {
          // If the edit action was triggered, emit the event
          this.eventSelected.emit(result.event);
        }
      }
    });
  }

  /**
   * Selects a specific event (prevents event bubbling)
   */
  selectEvent(event: any, e: MouseEvent): void {
    e.stopPropagation(); // Prevent the day click event from firing

    // Open the modal with event details
    const dialogRef = this.dialog.open(JobModalComponent, {
      width: '500px',
      data: {
        title: event.location,
        location: event.location,
        description: event.description,
        date: new Date(event.date).toLocaleDateString(),
        status: event.status,
        eventDetails: event
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventSelected.emit(event);
      }
    });
  }

  getHeaderText(): string {
    if (this.currentView === 'weekly') {
      const startOfWeek = this.weekDays[0]?.date;
      const endOfWeek = this.weekDays[6]?.date;

      if (!startOfWeek || !endOfWeek) return '';

      const startMonth = startOfWeek.toLocaleString('default', { month: 'short' });
      const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      } else {
        return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      }
    } else {
      return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
  }
}
