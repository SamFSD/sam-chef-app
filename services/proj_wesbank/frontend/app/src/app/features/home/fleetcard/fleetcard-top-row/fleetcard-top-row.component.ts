import { Component, Input, SimpleChanges } from '@angular/core';
interface FuelData {
  title: string;
  value: number;
  count: number;
  icon: string;
  highest_vehicle: {
    vehiclereg: string;
    value: number;
    count: number;
  };
}
@Component({
  selector: 'app-fleetcard-top-row',
  templateUrl: './fleetcard-top-row.component.html',
  styleUrls: ['./fleetcard-top-row.component.scss'],
})
export class FleetcardTopRowComponent {
  @Input() fleetcardTopRow!: [FuelData];

  ngOnInit(): void {
    this.fleetcardTopRow;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fleetcardTopRow']) {
      this.fleetcardTopRow;
    }
  }
}
