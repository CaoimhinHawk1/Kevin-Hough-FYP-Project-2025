import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

interface NavItem {
  icon: string;
  text: string;
  active?: boolean;
}

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="p-4 w-60 rounded-2xl">
      <div class="w-full">
<!--        <div class="flex flex-col items-start pt-2 pr-2 pb-4 pl-3 w-full">-->
<!--          <img-->
<!--            src="https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/523f32fa51e7191f582a0ee42616b650800ae3c0?placeholderIfAbsent=true"-->
<!--            class="object-contain max-w-full aspect-[3.73] w-[153px]"-->
<!--            alt="Logo"-->
<!--          />-->
<!--        </div>-->

        <nav>
          <ng-container *ngFor="let item of navItems">
            <div
              class="flex flex-wrap gap-3 items-center p-3 mt-2 w-full rounded-3xl"
              [class.shadow-sm]="item.active"
              [class.bg-black]="item.active"
              [class.bg-opacity-0]="item.active"
            >
              <div
                class="flex justify-center items-center self-stretch px-2 my-auto w-10 h-10 bg-white rounded-xl"
              >
                <img
                  [src]="item.icon"
                  class="object-contain self-stretch my-auto w-6 aspect-square"
                  alt="Navigation icon"
                />
              </div>
              <span
                class="flex-1 shrink self-stretch my-auto text-base tracking-normal text-black whitespace-nowrap rounded-lg basis-4"
              >
                {{ item.text }}
              </span>
            </div>
          </ng-container>
        </nav>

        <div
          class="flex flex-wrap gap-3 items-center px-4 py-3 w-full rounded-3xl mt-[1091px] max-md:mt-10"
        >
          <div
            class="flex justify-center items-center self-stretch my-auto w-8 rounded-lg"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/239a0524c456b99ce0ea8ce539453c6c68705bb3?placeholderIfAbsent=true"
              class="object-contain self-stretch my-auto w-8 aspect-square rounded-[80px]"
              alt="User avatar"
            />
          </div>
          <span
            class="self-stretch my-auto text-sm tracking-normal leading-none text-black whitespace-nowrap rounded-lg w-[58px]"
          >
            ByeWind
          </span>
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SidebarComponent {
  navItems: NavItem[] = [
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/ec22471aed36c6cb8508bf0e3b407ba58767568a?placeholderIfAbsent=true",
      text: "Overview",
      active: true,
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/7fe3c33bf2f6218e64f804691066ab4721a4064c?placeholderIfAbsent=true",
      text: "eCommerce",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/0af86c4520c901cb6abbe62a73cf0b00811a5ee0?placeholderIfAbsent=true",
      text: "Jobs",
    },
    {
      icon: "https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/6827d179954e2392015504c9d5ce34f4a3ffe236?placeholderIfAbsent=true",
      text: "Account",
    },
  ];
}
