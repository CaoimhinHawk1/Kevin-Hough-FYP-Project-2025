import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { NavigationService } from "../../../services/navigation.service";
import { Observable } from "rxjs";
import { LoginComponent } from "../login/login.component";

@Component({
    selector: "app-header",
    template: `
    <header
      class="fixed top-0 left-0 right-0 z-50 flex overflow-hidden flex-wrap gap-2 items-center p-1 bg-white border-b border-zinc-300"
    >
      <div class="flex gap-6 items-center self-stretch my-auto w-[169px]">
        <img
          src="../../../assets/images/logo1.png"
          class="object-contain self-stretch my-auto rounded-md aspect-[1.34] w-[100px]"
          alt="Logo"
        />
      </div>
      <nav
        *ngIf="isDashboard$ | async"
        class="flex flex-wrap flex-1 shrink gap-2 items-start self-stretch my-auto text-base leading-none whitespace-nowrap basis-0 min-w-60 text-stone-900 max-md:max-w-full"
      >
        <button routerLink="/dashboard" class="gap-2 self-stretch p-2 rounded-lg bg-neutral-100">
          Dashboard
        </button>
        <button class="gap-2 self-stretch p-2 rounded-lg">Settings</button>
      </nav>
      <div class="flex gap-3 items-center self-stretch my-auto text-base leading-none text-stone-900 w-[178px]">
        <app-login></app-login>
      </div>
    </header>
  `,
    styles: [
        `
      :host {
        display: block;
        height: 56px;
      }

      header {
        width: 100%;
      }
    `,
    ],
    imports: [CommonModule, RouterLink, LoginComponent]
})
export class HeaderComponent implements OnInit {
  isDashboard$: Observable<boolean>;

  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {
    this.isDashboard$ = this.navigationService.isDashboardPage$;
  }

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.navigationService.setDashboardPage(this.router.url === '/dashboard');
    });
  }
}
