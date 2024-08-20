import { Pipe, PipeTransform } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';

@Pipe({
  name: 'toTabZAR'
})
export class ToTabZARPipe implements PipeTransform {

  constructor(private gs: GlobalService) {}

  transform(value: any): any {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      ...this.gs.toTabZAR(),
    }).format(value);
  }

}
