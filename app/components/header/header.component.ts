import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-header",
  template: `
    <header
      class="flex overflow-hidden flex-wrap gap-6 items-center p-8 bg-white border-b border-zinc-300 max-md:px-5"
    >
      <div class="flex gap-6 items-center self-stretch my-auto w-[169px]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/ad7d09571639370ed17afa12f57cbd4157a8f0f9?placeholderIfAbsent=true"
          class="object-contain self-stretch my-auto rounded-md aspect-[1.34] w-[169px]"
          alt="Logo"
        />
      </div>
      <nav
        class="flex flex-wrap flex-1 shrink gap-2 items-start self-stretch my-auto text-base leading-none whitespace-nowrap basis-0 min-w-60 text-stone-900 max-md:max-w-full"
      >
        <button class="gap-2 self-stretch p-2 rounded-lg bg-neutral-100">
          Products
        </button>
        <button class="gap-2 self-stretch p-2 rounded-lg">Solutions</button>
        <button class="gap-2 self-stretch p-2 rounded-lg">Pricing</button>
        <button class="gap-2 self-stretch p-2 rounded-lg">Contact</button>
      </nav>
      <div
        class="flex gap-3 items-center self-stretch my-auto text-base leading-none text-stone-900 w-[178px]"
      >
        <button
          class="overflow-hidden flex-1 shrink gap-2 self-stretch p-2 my-auto w-full rounded-lg border border-solid basis-0 bg-neutral-200 border-neutral-500"
        >
          Sign in
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export default class HeaderComponent {}
