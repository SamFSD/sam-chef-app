import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-total-costs-ranker',
  templateUrl: './total-costs-ranker.component.html',
  styleUrls: ['./total-costs-ranker.component.scss'],
})
export class TotalCostsRankerComponent {
  @Input() division?: string;
  @Input() branch?: string;
  @Input() topAssets?: any;
  @Input() botAssets?: any;
  constructor() {}

  ngOnInit() {}
}
