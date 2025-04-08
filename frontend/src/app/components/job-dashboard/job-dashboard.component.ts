// src/app/components/job-dashboard/job-dashboard.component.ts
import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NavigationService } from "../../../services/navigation.service";
import { MatDialog } from "@angular/material/dialog";
import { JobModalComponent } from "./job-modal/job-model.component";
import { JobCalendarComponent } from "./job-calendar/job-calendar.component";

interface JobListing {
  id: string;
  location: string;
  description: string;
  date: Date;
  status: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'consumable' | 'equipment';
  quantity: number;
  threshold: number; // Low stock threshold
  unit: string; // e.g., "pcs", "boxes", "rolls"
  status?: 'available' | 'low' | 'out'; // Computed status
}

// Maintenance item interface
interface MaintenanceItem {
  id: string;
  equipmentName: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  status: 'upcoming' | 'due' | 'overdue' | 'in-progress';
  notes?: string;
}

// Equipment usage interface
interface EquipmentUsage {
  id: string;
  name: string;
  totalUnits: number;
  inUse: number;
  available: number;
  category: string; // e.g., "marquee", "lighting", "flooring"
}

interface Marquee {
  size: string;
  checked: boolean;
  assigned: boolean;
}

interface Vehicle {
  initial: string;
  name: string;
  available: boolean; // true = available, false = taken for a job
}

@Component({
  selector: "app-job-dashboard",
  templateUrl: './job-dashboard.component.html',
  styleUrls: ["./job-dashboard.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, JobCalendarComponent],
})
export class JobDashboardComponent implements OnInit, OnDestroy {
  searchQuery: string = "";
  activeView: "weekly" | "monthly" = "weekly";
  vehicleView: "today" | "weekly" = "today";
  selectedDay: string = "Monday";
  screenWidth: number = window.innerWidth;

  // Sample job listings with dates
  marquees: Marquee[] = [
    { size: "40x50", checked: true, assigned: false },
    { size: "50x120", checked: true, assigned: false },
    { size: "20x20", checked: true, assigned: false },
    { size: "20x20", checked: true, assigned: false },
    { size: "40x60", checked: true, assigned: false },
    { size: "30x80", checked: true, assigned: false },
  ];

  inventoryItems: InventoryItem[] = [
    {
      id: 'inv1',
      name: '5m Flooring',
      category: 'consumable',
      quantity: 120,
      threshold: 200,
      unit: 'pcs',
      status: 'low'
    },
    {
      id: 'inv2',
      name: '3m Marquee Walls',
      category: 'consumable',
      quantity: 350,
      threshold: 100,
      unit: 'pcs',
      status: 'available'
    },
    {
      id: 'inv3',
      name: '3m Lining Swags',
      category: 'consumable',
      quantity: 15,
      threshold: 20,
      unit: 'rolls',
      status: 'low'
    },
    {
      id: 'inv4',
      name: 'Chandelier Lights',
      category: 'consumable',
      quantity: 0,
      threshold: 10,
      unit: 'pcs',
      status: 'out'
    }
  ];

// Sample maintenance data
  maintenanceItems: MaintenanceItem[] = [
    {
      id: 'maint1',
      equipmentName: 'Generator A',
      lastMaintenance: new Date(2024, 11, 15),
      nextMaintenance: new Date(2025, 4, 15),
      status: 'due',
      notes: 'Oil change and filter replacement needed'
    },
    {
      id: 'maint2',
      equipmentName: 'Pressure Washer',
      lastMaintenance: new Date(2024, 10, 20),
      nextMaintenance: new Date(2025, 3, 20),
      status: 'overdue',
      notes: 'Replace nozzle and check pump'
    },
    {
      id: 'maint3',
      equipmentName: 'Marquee Fabric Cleaner',
      lastMaintenance: new Date(2025, 1, 5),
      nextMaintenance: new Date(2025, 5, 5),
      status: 'upcoming'
    }
  ];

// Sample equipment usage data
  equipmentUsage: EquipmentUsage[] = [
    {
      id: 'eq1',
      name: 'Marquee Frames 20x40',
      totalUnits: 8,
      inUse: 5,
      available: 3,
      category: 'marquee'
    },
    {
      id: 'eq2',
      name: 'LED String Lights',
      totalUnits: 25,
      inUse: 18,
      available: 7,
      category: 'lighting'
    },
    {
      id: 'eq3',
      name: 'Wheelchair Friendly Portaloos',
      totalUnits: 12,
      inUse: 8,
      available: 4,
      category: 'flooring'
    },
    {
      id: 'eq4',
      name: 'Heaters',
      totalUnits: 6,
      inUse: 6,
      available: 0,
      category: 'equipment'
    }
  ];

  vehicles: Vehicle[] = [
    { initial: "A", name: "TOYOTA LANDCRUISER 12-L-4567", available: true },
    { initial: "A", name: "TOYOTA LANDCRUISER 08-C-854", available: false },
    { initial: "A", name: "TOYOTA LANDCRUISER 10-L-92", available: true },
    { initial: "A", name: "TOYOTA HILUX 171-L-685", available: false },
  ];

  jobListings: JobListing[] = [
    {
      id: "1",
      location: "Co. Cork",
      description: "20x50 Marquee Setup",
      date: new Date(2025, 3, 8), // April 8, 2025
      status: "Pending"
    },
    {
      id: "2",
      location: "Co. Cork",
      description: "40x80 Marquee Setup",
      date: new Date(2025, 3, 8), // April 8, 2025
      status: "Confirmed"
    },
    {
      id: "3",
      location: "Co. Limerick",
      description: "6 Portaloos Installation",
      date: new Date(2025, 3, 9), // April 9, 2025
      status: "Pending"
    },
    {
      id: "4",
      location: "Co. Limerick",
      description: "30x60 Marquee Setup",
      date: new Date(2025, 3, 10), // April 10, 2025
      status: "Confirmed"
    },
    {
      id: "5",
      location: "Co. Clare",
      description: "3m Pagoda Installation",
      date: new Date(2025, 3, 11), // April 11, 2025
      status: "Confirmed"
    },
    {
      id: "6",
      location: "Co. Cork",
      description: "20x50 Marquee Dismantling",
      date: new Date(2025, 3, 11), // April 11, 2025
      status: "Pending"
    },
    {
      id: "7",
      location: "Co. Cork",
      description: "40x80 Marquee Dismantling",
      date: new Date(2025, 3, 12), // April 12, 2025
      status: "Pending"
    },
    {
      id: "8",
      location: "Co. Limerick",
      description: "30x60 Marquee Dismantling",
      date: new Date(2025, 3, 12), // April 12, 2025
      status: "Pending"
    },
    {
      id: "9",
      location: "Co. Clare",
      description: "3m Pagoda Dismantling",
      date: new Date(2025, 3, 12), // April 12, 2025
      status: "Pending"
    }
  ];

  constructor(
    private navigationService: NavigationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.navigationService.setDashboardPage(true);
    console.log('Job dashboard initialized');

    // Initialize with today's date
    const today = new Date();
    console.log('Today:', today.toLocaleDateString());
  }

  ngOnDestroy(): void {
    this.navigationService.setDashboardPage(false);
    console.log('Job dashboard destroyed');

    // Clean up any subscriptions or resources here
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
  }

  setActiveView(view: "weekly" | "monthly"): void {
    console.log('Setting active view to:', view);
    this.activeView = view;
  }

  setVehicleView(view: "today" | "weekly"): void {
    console.log('Setting vehicle view to:', view);
    this.vehicleView = view;
  }

  isMobileView(): boolean {
    return this.screenWidth < 768;
  }

  toggleMarqueeAssignment(index: number): void {
    this.marquees[index].assigned = !this.marquees[index].assigned;

    // Log the change for debugging or tracking
    console.log(`Marquee ${this.marquees[index].size} is now ${this.marquees[index].assigned ? 'assigned' : 'unassigned'}`);

    // In a real application, you might want to call a service to update the server
    // this.marqueeService.updateAssignment(this.marquees[index]);
  }

  handleEventSelected(event: any): void {
    this.showJobDetails(event);
  }

  activeInventoryTab: 'consumables' | 'maintenance' | 'equipment' = 'consumables';

  /**
   * Set the active inventory tab
   */
  setActiveInventoryTab(tab: 'consumables' | 'maintenance' | 'equipment'): void {
    this.activeInventoryTab = tab;
    console.log(`Active inventory tab set to: ${tab}`);
  }

  /**
   * Calculate inventory status based on quantity and threshold
   */
  calculateInventoryStatus(item: InventoryItem): 'available' | 'low' | 'out' {
    if (item.quantity <= 0) {
      return 'out';
    } else if (item.quantity < item.threshold) {
      return 'low';
    }
    return 'available';
  }

  /**
   * Update the inventory data
   */
  refreshInventoryData(): void {
    // Update status for all inventory items
    this.inventoryItems.forEach(item => {
      item.status = this.calculateInventoryStatus(item);
    });

    // In a real application, this would fetch data from a service
    console.log('Inventory data refreshed');
  }

  showJobDetails(job: JobListing): void {
    console.log('Showing details for job:', job);

    const dialogRef = this.dialog.open(JobModalComponent, {
      data: {
        title: `Job at ${job.location}`,
        location: job.location,
        description: job.description,
        date: job.date.toLocaleDateString(),
        status: job.status,
        assignedTo: ["John Doe", "Jane Smith"],
        equipment: ["20x50 Marquee", "30x60 Marquee", "6 Portaloos"]
      },
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

  toggleVehicleAvailability(index: number): void {
    this.vehicles[index].available = !this.vehicles[index].available;

    // Log the change for debugging or tracking
    console.log(`Vehicle ${this.vehicles[index].name} is now ${this.vehicles[index].available ? 'available' : 'unavailable'}`);

    // In a real application, you might want to call a service to update the server
    // this.vehicleService.updateAvailability(this.vehicles[index]);
  }

  /**
   * Open job details modal
   */
  editJob(job: JobListing): void {
    // In a real app, you would open an edit form or navigate to an edit page
    console.log('Editing job:', job);
    // For now, just show an alert
    alert(`Editing job: ${job.description} at ${job.location}`);
  }

  /**
   * Check if a date is today
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  }
}
