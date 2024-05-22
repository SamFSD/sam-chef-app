import { Component, Input, SimpleChanges } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-costs-podium',
  templateUrl: './costs-podium.component.html',
  styleUrls: ['./costs-podium.component.scss'],
})
export class CostsPodiumComponent {
  constructor(private globalService: GlobalService) {}
  @Input() costsObj = {
    avg_costs: 0,
    avg_costs_branch: 0,
    avg_cpks: 0,
    avg_cpks_branch: 0,
    branch: '',
    component_map: '',
    costs: 0,
    cpk: 0,
    distance: 0,
    max_ranking_branch: 12,
    max_ranking_fleet: 0,
    percentage_avg_costs: 0,
    percentage_avg_costs_branch: 0,
    percentage_avg_cpk: 0,
    percentage_avg_cpk_branch: 0,
    ranking_branch_costs: 0,
    ranking_branch_cpk: 0,
    ranking_fleet_costs: 0,
    ranking_fleet_cpk: 0,
    vehiclereg: '',
  };
  totalObj = {
    avg_costs: 0,
    avg_costs_branch: 0,
    avg_cpks: 0,
    avg_cpks_branch: 0,
    branch: '',
    component_map: '',
    costs: 0,
    cpk: 0,
    distance: 0,
    max_ranking_branch: 12,
    max_ranking_fleet: 0,
    percentage_avg_costs: 0,
    percentage_avg_costs_branch: 0,
    percentage_avg_cpk: 0,
    percentage_avg_cpk_branch: 0,
    ranking_branch_costs: 0,
    ranking_branch_cpk: 0,
    ranking_fleet_costs: 0,
    ranking_fleet_cpk: 0,
    vehiclereg: '',
  };

  obj: any;
  totalObject: any;
  @Input() distancesTotals: any;
  ngOnInit() {}

  ngOnChanges(changed: SimpleChanges) {
    if (changed['costsObj']) {
      this.globalService.passCPKRankings.next(changed['costsObj']);
      this.totalObj = changed['costsObj'].currentValue.find(
        (obj: any) => obj.component_map === 'Total'
      );
    }
    // if (changed['distancesTotals']) {
    //

    //   // this.distancesTotals = changed['distancesTotals'].currentValue.find((obj: any) => obj.component_map === 'Total');
    //
    // }
  }

  getColor(percentage: number): string {
    if (percentage <= 80) {
      // Green color for 0% to 80%
      return 'green';
    } else if (percentage > 115) {
      // Red color for greater than 115%
      return 'red';
    } else {
      // Transition color between green and red
      const red = Math.floor(((percentage - 80) * 255) / 35);
      const green = 255 - red;
      return `rgb(${red}, ${green}, 0)`;
    }
  }
}
