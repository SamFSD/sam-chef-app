import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-contract-expirey-ranker',
  templateUrl: './contract-expirey-ranker.component.html',
  styleUrls: ['./contract-expirey-ranker.component.scss'],
})
export class ContractExpireyRankerComponent {
  @Input() division?: string;
  @Input() branch?: string;
  @Input() topAssets?: any;
  @Input() botAssets?: any;
  constructor() {}
}
