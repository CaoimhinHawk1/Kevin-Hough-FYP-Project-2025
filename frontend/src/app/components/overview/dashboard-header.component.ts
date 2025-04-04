import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

interface ActionButton {
  icon: string;
  tooltip: string;
  shortcut: string;
}

@Component({
  selector: "app-dashboard-header",
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="flex flex-wrap flex-1 shrink gap-10 justify-between items-center w-full rounded-2xl basis-12 min-w-80 max-md:max-w-full"
    >
<!--      <div class="flex gap-2 items-center self-stretch my-auto min-w-60">-->
<!--        <div-->
<!--          class="flex flex-wrap gap-1 items-center self-stretch my-auto rounded-lg"-->
<!--        >-->
<!--          <ng-container *ngFor="let button of actionButtons">-->
<!--            <div-->
<!--              class="flex relative gap-2 justify-center items-start self-stretch p-4 my-auto w-14 rounded-2xl"-->
<!--            >-->
<!--              <div-->
<!--                class="flex z-0 justify-center items-center my-auto w-6 rounded-lg"-->
<!--              >-->
<!--                <img-->
<!--                  [src]="button.icon"-->
<!--                  class="object-contain self-stretch my-auto w-6 aspect-square"-->
<!--                  alt="Action icon"-->
<!--                />-->
<!--              </div>-->
<!--              <div-->
<!--                class="flex absolute top-2/4 left-2/4 z-0 gap-1 items-center self-start px-2 py-1 text-xs tracking-normal leading-none whitespace-nowrap rounded-lg -translate-x-2/4 -translate-y-2/4 backdrop-blur-[20px] bg-black bg-opacity-80"-->
<!--              >-->
<!--                <div-->
<!--                  class="flex flex-wrap gap-2 items-center self-stretch my-auto rounded-lg"-->
<!--                >-->
<!--                  <span class="self-stretch my-auto text-white">{{-->
<!--                    button.tooltip-->
<!--                  }}</span>-->
<!--                  <span class="self-stretch my-auto text-white">{{-->
<!--                    button.shortcut-->
<!--                  }}</span>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </ng-container>-->
<!--        </div>-->

        <nav
          class="flex flex-wrap gap-1 items-center self-stretch my-auto text-base tracking-normal text-black whitespace-nowrap rounded-lg"
          aria-label="Breadcrumb"
        >
          <div
            class="flex gap-2 justify-center items-center self-stretch px-4 py-2 my-auto text-center rounded-xl w-[123px]"
          >
            <span class="self-stretch my-auto rounded-lg w-[91px]"
              >Dashboards</span
            >
          </div>
          <span
            class="self-stretch my-auto text-sm leading-none rounded-lg w-[5px]"
            >/</span
          >
          <div
            class="flex gap-2 justify-center items-center self-stretch px-4 py-2 my-auto text-center text-black rounded-xl w-[104px]"
          >
            <span class="self-stretch my-auto rounded-lg w-[72px]"
              >Overview</span
            >
          </div>
        </nav>
<!--      </div>-->

<!--      <div class="flex gap-4 items-center self-stretch my-auto min-w-60">-->
<!--        <div-->
<!--          class="flex overflow-hidden flex-wrap gap-2 items-center self-stretch px-3 py-2 my-auto w-40 rounded-xl bg-black bg-opacity-0"-->
<!--        >-->
<!--          <div-->
<!--            class="flex flex-wrap flex-1 shrink gap-2 items-center self-stretch my-auto rounded-lg basis-0"-->
<!--          >-->
<!--            <div-->
<!--              class="flex justify-center items-center self-stretch my-auto w-4 rounded-lg"-->
<!--            >-->
<!--              <img-->
<!--                src="https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/536546b89093dc555d1a4842bea867b720b0e9c5?placeholderIfAbsent=true"-->
<!--                class="object-contain self-stretch my-auto w-4 aspect-square"-->
<!--                alt="Search icon"-->
<!--              />-->
<!--            </div>-->
<!--            <span-->
<!--              class="self-stretch my-auto text-sm tracking-normal leading-none text-black whitespace-nowrap rounded-lg w-[47px]"-->
<!--            >-->
<!--              Search-->
<!--            </span>-->
<!--          </div>-->
<!--          <div-->
<!--            class="self-stretch my-auto w-5 text-xs tracking-normal leading-none text-center text-black whitespace-nowrap rounded border border-solid bg-white bg-opacity-20 border-black border-opacity-0"-->
<!--          >-->
<!--            /-->
<!--          </div>-->
<!--        </div>-->

<!--        <div-->
<!--          class="flex flex-wrap gap-1 items-center self-stretch my-auto w-44 rounded-lg"-->
<!--        >-->
<!--          <ng-container *ngFor="let action of userActions">-->
<!--            <div-->
<!--              class="flex relative grow shrink gap-2 justify-center items-start self-stretch p-4 my-auto rounded-2xl w-[45px]"-->
<!--            >-->
<!--              <div-->
<!--                class="flex z-0 justify-center items-center my-auto w-6 rounded-lg"-->
<!--              >-->
<!--                <img-->
<!--                  [src]="action.icon"-->
<!--                  class="object-contain self-stretch my-auto w-6 aspect-square"-->
<!--                  alt="User action icon"-->
<!--                />-->
<!--              </div>-->
<!--              <div-->
<!--                class="flex absolute top-2/4 left-2/4 z-0 gap-1 items-center self-start px-2 py-1 text-xs tracking-normal leading-none whitespace-nowrap rounded-lg -translate-x-2/4 -translate-y-2/4 backdrop-blur-[20px] bg-black bg-opacity-80"-->
<!--              >-->
<!--                <div-->
<!--                  class="flex flex-wrap gap-2 items-center self-stretch my-auto rounded-lg"-->
<!--                >-->
<!--                  <span class="self-stretch my-auto text-white">{{-->
<!--                    action.tooltip-->
<!--                  }}</span>-->
<!--                  <span class="self-stretch my-auto text-white">{{-->
<!--                    action.shortcut-->
<!--                  }}</span>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </ng-container>-->
<!--        </div>-->
<!--      </div>-->
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class DashboardHeaderComponent {
  actionButtons: ActionButton[] = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/ce5034bc7e547d3c2a95a47352abffd83d8b1038?placeholderIfAbsent=true",
      tooltip: "Sidebar",
      shortcut: "⌘S",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/09ab048eccce8fc3b0a121f7b7097e73b3c5c115?placeholderIfAbsent=true",
      tooltip: "Favorites",
      shortcut: "⌘F",
    },
  ];

  userActions: ActionButton[] = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/d418a65aee947a87e26d5c688e425f85b3e2fb4a?placeholderIfAbsent=true",
      tooltip: "Toggle theme",
      shortcut: "⌘T",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/34d978f9380f2ded14234ee693e84956a85b4a8a?placeholderIfAbsent=true",
      tooltip: "Activities",
      shortcut: "⌘A",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/26f4049c2ac15d9907fb5e54f19071678f6d4d57?placeholderIfAbsent=true",
      tooltip: "Notifications",
      shortcut: "⌘N",
    },
  ];
}
