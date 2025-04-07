// src/shared/event.model.ts
import { Entity, Fields } from "remult";

@Entity("events", {
  allowApiCrud: true,
})
export class Event {
  @Fields.uuid()
  id!: string;
  
  @Fields.string()
  name = '';
  
  @Fields.date()
  date = new Date();
  
  @Fields.string()
  startTime = '09:00';
  
  @Fields.string()
  endTime = '10:00';
  
  @Fields.string({ allowNull: true })
  description?: string;
  
  @Fields.string({ allowNull: true })
  location?: string;
  
  @Fields.string({ allowNull: true })
  color?: string;
  
  @Fields.boolean()
  isAllDay = false;
  
  @Fields.createdAt()
  createdAt = new Date();
}
