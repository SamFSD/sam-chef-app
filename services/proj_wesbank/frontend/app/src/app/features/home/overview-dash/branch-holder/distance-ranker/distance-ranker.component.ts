import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-distance-ranker',
  templateUrl: './distance-ranker.component.html',
  styleUrls: ['./distance-ranker.component.scss'],
})
export class DistanceRankerComponent {
  @Input() division?: string;
  @Input() branch?: string;
  @Input() topAssets?: any;
  @Input() botAssets?: any;
  constructor() {}

  ngOnInit() {}
}
