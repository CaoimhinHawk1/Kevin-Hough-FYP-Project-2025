// import { ComponentFixture, TestBed } from "@angular/core/testing";
// import { FormsModule } from "@angular/forms";
// import { JobDashboardComponent } from "./job-dashboard.component";
// import { NavigationService } from "../../../services/navigation.service";
//
// describe("JobDashboardComponent", () => {
//   let component: JobDashboardComponent;
//   let fixture: ComponentFixture<JobDashboardComponent>;
//   let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
//
//   beforeEach(async () => {
//     const navSpy = jasmine.createSpyObj("NavigationService", [
//       "setDashboardPage",
//     ]);
//
//     await TestBed.configureTestingModule({
//       imports: [JobDashboardComponent, FormsModule],
//       providers: [{ provide: NavigationService, useValue: navSpy }],
//     }).compileComponents();
//
//     navigationServiceSpy = TestBed.inject(
//       NavigationService,
//     ) as jasmine.SpyObj<NavigationService>;
//     fixture = TestBed.createComponent(JobDashboardComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });
//
//   it("should create", () => {
//     expect(component).toBeTruthy();
//   });
//
//   it("should set dashboard page to true on init", () => {
//     expect(navigationServiceSpy.setDashboardPage).toHaveBeenCalledWith(true);
//   });
//
//   it("should change active view when setActiveView is called", () => {
//     component.setActiveView("monthly");
//     expect(component.activeView).toBe("monthly");
//
//     component.setActiveView("weekly");
//     expect(component.activeView).toBe("weekly");
//   });
//
//   it("should change vehicle view when setVehicleView is called", () => {
//     component.setVehicleView("weekly");
//     expect(component.vehicleView).toBe("weekly");
//
//     component.setVehicleView("today");
//     expect(component.vehicleView).toBe("today");
//   });
//
//   it("should filter jobs by day", () => {
//     const mondayJobs = component.getJobsForDay("Monday");
//     expect(mondayJobs.length).toBe(2);
//     expect(mondayJobs[0].location).toBe("Co. Cork");
//
//     const fridayJobs = component.getJobsForDay("Friday");
//     expect(fridayJobs.length).toBe(3);
//   });
// });
