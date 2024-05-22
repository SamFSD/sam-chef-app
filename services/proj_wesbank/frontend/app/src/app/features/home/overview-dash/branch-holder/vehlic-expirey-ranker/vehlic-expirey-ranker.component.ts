import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-vehlic-expirey-ranker',
  templateUrl: './vehlic-expirey-ranker.component.html',
  styleUrls: ['./vehlic-expirey-ranker.component.scss'],
})
export class VehlicExpireyRankerComponent {
  @Input() division?: string;
  @Input() branch?: string;
  @Input() topAssets?: any;
  @Input() botAssets?: any;
  constructor() {}
}
