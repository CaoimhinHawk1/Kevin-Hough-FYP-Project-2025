// pipes/filter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filter: { isCritical: boolean }): any[] {
    if (!items) {
      return [];
    }

    if (!filter.isCritical) {
      return items.filter(item => item.isCritical);
    }

    return items.filter(item => item.isCritical);
  }
}
