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
    imports: [CommonModule, FormsModule, MatDialogModule],
    template: `
    <div class="calendar-container bg-white rounded-lg shadow h-full">
      <!-- Calendar Header - Fixed at top -->
      <div class="calendar-header flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border-b gap-2 sm:gap-0">
        <div class="flex items-center gap-2">
          <button (click)="previousPeriod()" class="p-2 rounded hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h2 class="text-sm sm:text-lg font-semibold truncate max-w-[180px] sm:max-w-none">{{ getHeaderText() }}</h2>
          <button (click)="nextPeriod()" class="p-2 rounded hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="flex gap-2 self-end sm:self-auto">
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
      <div *ngIf="currentView === 'weekly'" class="calendar-scroll-container">
        <div class="weekly-view-container">
          <!-- Days of Week Header - Fixed when scrolling horizontally -->
          <div class="days-of-week-header">
            <div *ngFor="let day of daysOfWeek" class="day-header">
              {{ getShortDay(day) }}
            </div>
          </div>

          <!-- Weekly Calendar Grid - Scrollable area -->
          <div class="days-container">
            <div *ngFor="let day of weekDays"
                 class="day-column"
                 [class.today-cell]="day.isToday"
                 (click)="showDayModal(day)">
              <div class="day-header-cell">
                <span class="day-number" [class.today-number]="day.isToday">
                  {{ day.date.getDate() }}
                </span>
                <span class="day-name">
                  {{ day.date | date:'EEE' }}
                </span>
              </div>

              <!-- Events for day -->
              <div *ngIf="day.events.length > 0" class="events-container">
                <div *ngFor="let event of day.events.slice(0, 3)"
                     class="event-item"
                     (click)="selectEvent(event, $event)">
                  {{ event.description }}
                </div>
                <div *ngIf="day.events.length > 3" class="more-events">
                  +{{ day.events.length - 3 }} more
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly View -->
      <div *ngIf="currentView === 'monthly'" class="calendar-scroll-container">
        <div class="monthly-view-container">
          <!-- Days of Week Header -->
          <div class="days-of-week-header">
            <div *ngFor="let day of daysOfWeek" class="day-header">
              {{ getShortDay(day) }}
            </div>
          </div>

          <!-- Monthly Calendar Grid -->
          <div class="month-grid">
            <div *ngFor="let day of monthDays"
                 class="month-day-cell"
                 [class.opacity-40]="!day.isCurrentMonth"
                 [class.today-cell]="day.isToday"
                 (click)="showDayModal(day)">
              <div class="day-number-month" [class.today-number]="day.isToday">
                {{ day.date.getDate() }}
              </div>

              <!-- Events for month view -->
              <div *ngIf="day.events.length > 0" class="month-events-container">
                <div *ngFor="let event of day.events.slice(0, 2)"
                     class="month-event-item"
                     (click)="selectEvent(event, $event)">
                  {{ event.description }}
                </div>
                <div *ngIf="day.events.length > 2" class="more-events">
                  +{{ day.events.length - 2 }} more
                </div>
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
      overflow: hidden;
    }

    .calendar-scroll-container {
      flex: 1;
      overflow: auto;
      -webkit-overflow-scrolling: touch; /* For smoother scrolling on iOS */
      height: calc(100% - 60px);
    }

    /* Weekly View Styling */
    .weekly-view-container {
      min-width: 700px; /* Ensure enough width for all days */
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .days-of-week-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border-bottom: 1px solid #e5e7eb;
      background-color: white;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .day-header {
      padding: 8px;
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
      border-right: 1px solid #e5e7eb;
    }

    .day-header:last-child {
      border-right: none;
    }

    .days-container {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      flex: 1;
      min-height: 300px;
    }

    .day-column {
      border-right: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      padding: 8px;
      position: relative;
      min-height: 200px;
      overflow-y: auto;
      cursor: pointer;
    }

    .day-column:last-child {
      border-right: none;
    }

    .day-column:hover {
      background-color: #f9fafb;
    }

    .today-cell {
      background-color: #ebf5ff;
    }

    .day-header-cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      position: sticky;
      top: 0;
      background-color: inherit;
      padding-top: 4px;
      padding-bottom: 8px;
      z-index: 5;
    }

    .day-number {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .day-name {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .today-number {
      color: #3b82f6;
    }

    .events-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .event-item {
      padding: 4px;
      font-size: 0.75rem;
      background-color: #e0e7ff;
      border-radius: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }

    .more-events {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
      margin-top: 4px;
    }

    /* Monthly View Styling */
    .monthly-view-container {
      min-width: 350px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-auto-rows: minmax(60px, 1fr);
      flex: 1;
    }

    .month-day-cell {
      border-right: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      padding: 4px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      min-height: 70px;
    }

    .month-day-cell:last-child {
      border-right: none;
    }

    .month-day-cell:hover {
      background-color: #f9fafb;
    }

    .day-number-month {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .month-events-container {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .month-event-item {
      padding: 2px 4px;
      font-size: 0.75rem;
      background-color: #e0e7ff;
      border-radius: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }

    /* Improve scrollbars appearance */
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

    /* For Firefox */
    * {
      scrollbar-width: thin;
      scrollbar-color: #d1d5db transparent;
    }

    /* Touch interaction improvement for mobile */
    @media (max-width: 640px) {
      .day-column, .month-day-cell {
        padding: 4px;
      }

      .event-item, .month-event-item {
        padding: 6px 4px; /* Larger touch target */
      }

      /* Explicitly define tap highlight on mobile */
      .day-column:active, .month-day-cell:active,
      .event-item:active, .month-event-item:active {
        background-color: rgba(229, 231, 235, 0.5);
      }
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

  // Helper function to get shorter day names on mobile
  getShortDay(day: string): string {
    // Check if this is a mobile viewport
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? day.charAt(0) : day;
    }
    return day;
  }

  /**
   * Shows a modal with all events for a specific day
   */
  showDayModal(day: CalendarDay): void {
    // Determine dialog width based on screen size
    let dialogWidth = '500px';
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      dialogWidth = '95vw';
    }

    // Open the modal with day information
    const dialogRef = this.dialog.open(DayModalComponent, {
      width: dialogWidth,
      maxWidth: '95vw',
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

    // Determine dialog width based on screen size
    let dialogWidth = '500px';
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      dialogWidth = '95vw';
    }

    // Open the modal with event details
    const dialogRef = this.dialog.open(JobModalComponent, {
      width: dialogWidth,
      maxWidth: '95vw',
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

      // Use shorter date format - especially on mobile
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

      if (isMobile) {
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startMonth} ${startOfWeek.getDate()}-${endOfWeek.getDate()}`;
        } else {
          return `${startMonth} ${startOfWeek.getDate()}-${endMonth} ${endOfWeek.getDate()}`;
        }
      } else {
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
        } else {
          return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
        }
      }
    } else {
      // For month view, shorter format on mobile
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const monthFormat: Intl.DateTimeFormatOptions = isMobile ? { month: 'short', year: 'numeric' } : { month: 'long', year: 'numeric' };
      return this.currentDate.toLocaleString('default', monthFormat);
    }
  }
}
