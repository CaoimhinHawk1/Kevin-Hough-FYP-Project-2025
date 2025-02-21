import { Component } from '@angular/core';
import { Task } from '../../shared/task'
import {remult} from "remult";
import {NgForOf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-dashboard',
  imports: [
    NgForOf,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  newTaskTitle='';
  tasks: Task[] = [];
  taskRepo = remult.repo(Task);
  ngOnInit(){
    this.taskRepo.find({
      limit: 4,
      page: 1,
      orderBy: {
        completed: "asc"
      }
    }).then((tasks) => (this.tasks = tasks));
  }
}
