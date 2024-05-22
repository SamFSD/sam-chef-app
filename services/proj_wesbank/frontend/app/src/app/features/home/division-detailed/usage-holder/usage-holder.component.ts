import { Component, Input, SimpleChange, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-usage-holder',
  templateUrl: './usage-holder.component.html',
  styleUrls: ['./usage-holder.component.scss'],
})
export class UsageHolderComponent {
  @Input() branches: string[] = [''];

  ngOnChanges(_: SimpleChanges) {
    if (_['branches']) {
    }
  }
}
