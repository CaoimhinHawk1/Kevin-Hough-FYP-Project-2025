export interface Event {
  id: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  color?: string;
  isAllDay: boolean;
  createdAt: Date;
}
