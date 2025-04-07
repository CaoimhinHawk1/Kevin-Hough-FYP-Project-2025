// src/app/components/calendar/calendar.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../../../services/calendar-service';
import { Event } from '../../../../shared/';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @Input() viewType: 'weekly' | 'monthly' = 'weekly';

  // Calendar data
  currentDate: Date = new Date();
  weekDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
  calendarDays: Array<{date: Date, events: Event[]}> = [];

  // For weekly view
  weeklyDays: Array<{date: Date, events: Event[]}> = [];

  // For monthly view
  monthlyDays: Array<{date: Date, events: Event[], inMonth: boolean}> = [];

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.loadCalendarData();
  }

  loadCalendarData(): void {
    if (this.viewType === 'weekly') {
      this.generateWeeklyView();
    } else {
      this.generateMonthlyView();
    }
  }

  generateWeeklyView(): void {
    this.weeklyDays = [];

    // Get first day of the week (Sunday)
    const firstDayOfWeek = new Date(this.currentDate);
    const day = this.currentDate.getDay();
    firstDayOfWeek.setDate(this.currentDate.getDate() - day);

    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);

      this.calendarService.getEventsByDate(date).subscribe(events => {
        this.weeklyDays.push({
          date: date,
          events: events
        });
        // Sort days by date
        this.weeklyDays.sort((a, b) => a.date.getTime() - b.date.getTime());
      });
    }
  }

  generateMonthlyView(): void {
    this.monthlyDays = [];

    // Get first day of the month
    const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);

    // Get last day of the month
    const lastDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    // Get first day to display (might be from previous month)
    const firstDayToShow = new Date(firstDayOfMonth);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    firstDayToShow.setDate(firstDayToShow.getDate() - firstDayOfWeek);

    // Generate calendar grid (42 days = 6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstDayToShow);
      date.setDate(firstDayToShow.getDate() + i);

      const inCurrentMonth = date.getMonth() === this.currentDate.getMonth();

      this.calendarService.getEventsByDate(date).subscribe(events => {
        this.monthlyDays.push({
          date: date,
          events: events,
          inMonth: inCurrentMonth
        });
        // Sort days by date
        this.monthlyDays.sort((a, b) => a.date.getTime() - b.date.getTime());
      });

      // Break if we've gone to the next month and completed a week
      if (date.getMonth() > this.currentDate.getMonth() && date.getDay() === 6) {
        break;
      }
    }
  }

  nextPeriod(): void {
    if (this.viewType === 'weekly') {
      // Move to next week
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      // Move to next month
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.loadCalendarData();
  }

  prevPeriod(): void {
    if (this.viewType === 'weekly') {
      // Move to previous week
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      // Move to previous month
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.loadCalendarData();
  }

  today(): void {
    this.currentDate = new Date();
    this.loadCalendarData();
  }

  // Format date for display
  formatDate(date: Date): string {
    return `${date.getDate()}`;
  }

  // Get formatted month and year
  getMonthYearString(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  // Get week range string for display
  getWeekRangeString(): string {
    if (this.weeklyDays.length < 7) return '';

    const firstDay = this.weeklyDays[0].date;
    const lastDay = this.weeklyDays[6].date;

    return `${this.formatDateWithMonth(firstDay)} - ${this.formatDateWithMonth(lastDay)}`;
  }

  // Format date with month for display
  formatDateWithMonth(date: Date): string {
    return `${this.monthNames[date.getMonth()].substring(0, 3)} ${date.getDate()}`;
  }

  // Toggle between weekly and monthly view
  toggleView(): void {
    this.viewType = this.viewType === 'weekly' ? 'monthly' : 'weekly';
    this.loadCalendarData();
  }
}
