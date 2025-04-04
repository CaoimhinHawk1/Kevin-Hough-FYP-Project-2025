import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarComponent } from "./sidebar.component";
import { DashboardHeaderComponent } from "./dashboard-header.component";
import { StatCardComponent } from "./stat-card.component";
import { ChartBlockComponent } from "./chart-block.component";


@Component({
  selector: "app-overview",
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    DashboardHeaderComponent,
    StatCardComponent,
    ChartBlockComponent,
  ],
  template: `
    <div class="flex overflow-hidden flex-wrap p-4 bg-neutral-100 rounded-[32px]">
      <app-sidebar></app-sidebar>
      <div class="flex flex-wrap flex-1 shrink gap-4 items-start self-start p-4 basis-0 min-w-60 max-md:max-w-full">
        <app-dashboard-header></app-dashboard-header>



        <app-chart-block type="users" title="Upcoming Jobs (Weekly)" chartImageUrl="https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/af5a4e5a2f2d987c13d926fea2957e5f494edd84?placeholderIfAbsent=true">
          <img [src]="'https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/af5a4e5a2f2d987c13d926fea2957e5f494edd84?placeholderIfAbsent=true'"
               alt="Users chart"
               class="w-full h-auto">
        </app-chart-block>


        <app-chart-block type="locationTraffic" title="Location Traffic" colorClass="text-green-500">
          <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            Location Traffic Chart Placeholder
          </div>
        </app-chart-block>



      </div>
    </div>

  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export default class Overview {}
