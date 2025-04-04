import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private isOverviewPage = new BehaviorSubject<boolean>(false);
  isDashboardPage$ = this.isOverviewPage.asObservable();

  setDashboardPage(value: boolean) {
    this.isOverviewPage.next(value);
  }
}
