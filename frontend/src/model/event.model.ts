export interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  description?: string;
  customerId?: string;
  items?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
