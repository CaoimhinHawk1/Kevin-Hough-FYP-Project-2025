import { Component, OnInit, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NavigationService } from "../../../services/navigation.service";
import {MatDialog} from "@angular/material/dialog";
import { JobModalComponent } from "./job-modal/job-model.component";

interface JobListing {
  location: string;
  description: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
}

interface JobModal {
  title: string;
  location: string;
  description: string;
  date: string;
  status: string;
  assignedTo: string[];
  equipment: string[];
}

interface Marquee {
  size: string;
  checked: boolean;
}

interface Vehicle {
  initial: string;
  name: string;
}

@Component({
  selector: "app-job-dashboard",
  templateUrl: "./job-dashboard.component.html",
  styleUrls: ["./job-dashboard.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class JobDashboardComponent implements OnInit {
  searchQuery: string = "";
  activeView: "weekly" | "monthly" = "weekly";
  vehicleView: "today" | "weekly" = "today";
  selectedDay: string = "Monday";
  screenWidth: number = window.innerWidth;

  days: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  jobListings: JobListing[] = [
    { location: "Co. Cork", description: "20x50, 30x...", day: "Monday" },
    { location: "Co. Cork", description: "40x80", day: "Monday" },
    { location: "Co. Limerick", description: "6 Portaloos", day: "Tuesday" },
    { location: "Co. Limerick", description: "30x60", day: "Wednesday" },
    { location: "Co. Clare", description: "3m Pagoda", day: "Thursday" },
    { location: "Co. Cork", description: "20x50, 30x...", day: "Thursday" },
    { location: "Co. Cork", description: "40x80", day: "Friday" },
    { location: "Co. Limerick", description: "30x60", day: "Friday" },
    { location: "Co. Clare", description: "3m Pagoda", day: "Friday" },
  ];

  marquees: Marquee[] = [
    { size: "40x50", checked: true },
    { size: "50x120", checked: true },
    { size: "20x20", checked: true },
    { size: "20x20", checked: true },
    { size: "40x60", checked: true },
    { size: "30x80", checked: true },
  ];

  vehicles: Vehicle[] = [
    { initial: "A", name: "TOYOTA LANDCRUISER 12-L-4567" },
    { initial: "A", name: "TOYOTA LANDCRUISER 08-C-854" },
    { initial: "A", name: "TOYOTA LANDCRUISER 10-L-92" },
    { initial: "A", name: "TOYOTA HILUX 171-L-685" },
  ];



  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
  }

  constructor(
      private navigationService: NavigationService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.navigationService.setDashboardPage(true);
  }

  ngOnDestroy(): void {
    this.navigationService.setDashboardPage(false);
  }

  setActiveView(view: "weekly" | "monthly"): void {
    this.activeView = view;
  }

  setVehicleView(view: "today" | "weekly"): void {
    this.vehicleView = view;
  }

  getJobsForDay(day: string): JobListing[] {
    return this.jobListings.filter((job) => job.day === day);
  }

  showJobDetails(job: JobListing): void {
    console.log("Showing details for job:", job);
    // Implement navigation or modal display logic here
  }

  isMobileView(): boolean {
    return this.screenWidth < 768;
  }

  showJobDetails(job: JobListing): void {
    const modalData: JobModal = {
      title: `Job at ${job.location}`,
      location: job.location,
      description: job.description,
      date: job.day,
      status: "Pending",
      assignedTo: ["John Doe", "Jane Smith"],
      equipment: ["20x50 Marquee", "30x60 Marquee", "6 Portaloos"]
    };

    const dialogRef = this.dialog.open(JobModalComponent, {
      data: modalData,
      width: '90%',
      maxWidth: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'edit') {
        // Handle edit action
        console.log('Edit job:', job);
      }
    });
  }
}
