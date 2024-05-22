import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-component-cost-ranker',
  templateUrl: './component-cost-ranker.component.html',

  styleUrls: ['./component-cost-ranker.component.scss'],
})
export class ComponentCostRankerComponent {
  @Input() division: string = 'test';
  @Input() branch?: string;
  constructor() {}
}
