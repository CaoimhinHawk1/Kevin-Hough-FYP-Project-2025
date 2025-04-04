import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="flex-1 shrink p-6 rounded-3xl basis-0 min-w-[272px] max-md:px-5"
    >
      <div class="flex flex-wrap gap-2 items-center w-full rounded-lg">
        <h3
          class="flex-1 shrink self-stretch my-auto text-base tracking-normal text-white whitespace-nowrap rounded-lg basis-4"
        >
          {{ title }}
        </h3>
        <div
          class="flex justify-center items-center self-stretch px-2 py-1 my-auto w-11 border border-solid shadow-sm bg-white bg-opacity-0 border-[color:var(--Linear-Border-lighting,rgba(255,255,255,0.40))] rounded-[80px]"
        >
          <img
            [src]="iconUrl"
            class="object-contain self-stretch my-auto w-7 aspect-square"
            alt="Stat icon"
          />
        </div>
      </div>
      <div
        class="flex flex-wrap gap-2 justify-between items-center mt-2 w-full tracking-normal text-white whitespace-nowrap rounded-lg"
      >
        <p
          class="flex-1 shrink self-stretch my-auto text-3xl font-semibold leading-none rounded-lg basis-0"
        >
          {{ value }}
        </p>
        <p class="self-stretch my-auto text-lg leading-loose rounded-lg">
          {{ percentage }}
        </p>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class StatCardComponent {
  @Input() title: string = "";
  @Input() value: string = "";
  @Input() percentage: string = "";
  @Input() iconUrl: string = "";
}
