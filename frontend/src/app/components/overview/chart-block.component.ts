import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="overflow-hidden flex-1 shrink p-6 bg-white rounded-3xl shadow-sm basis-0 min-w-80 max-md:px-5 max-md:max-w-full"
    >
      <div
        class="flex flex-wrap gap-2 items-center w-full rounded-lg max-md:max-w-full"
      >
        <h2
          class="flex-1 shrink self-stretch my-auto text-lg font-semibold tracking-normal leading-loose rounded-lg basis-4 min-w-60 max-md:max-w-full"
          [ngClass]="titleColorClass"
        >
          {{ title }}
        </h2>
        <div
          class="flex gap-2 justify-center items-center self-stretch px-2 my-auto w-10 h-10 rounded-xl bg-black bg-opacity-0 min-h-10"
        >
          <div
            class="flex justify-center items-center self-stretch my-auto w-5 rounded-lg"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/3442e6b8e527437aa22d70a48962b97f/a8f7375388c65a6a906187dc1298aee53bb22aa0?placeholderIfAbsent=true"
              class="object-contain self-stretch my-auto w-5 aspect-square"
              alt="More options"
            />
          </div>
        </div>
      </div>
      <div class="mt-6 w-full">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ChartBlockComponent {
  @Input() title: string = '';
  @Input() titleColorClass: string = 'text-blue-600';
}
