import { Component, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CpksChartsAndGraphsService } from 'src/app/core/api/api_service';
import // BranchComponent,
// branch_component_cpks,
'src/app/interfaces.interrface';

export interface BranchComponent {
  apiSub: any;
  branch: string;
  div_avg: number;
  div_data: {
    branch: string;
    component_cpk: number;
  }[];
}
@Component({
  selector: 'app-branch-component-cpks',
  templateUrl: './branch-component-cpks.component.html',
  styleUrls: ['./branch-component-cpks.component.scss'],
})
export class BranchComponentCpksComponent {
  isLoading: boolean = false;
  @Input() division: string = 'full_fleet';
  branchCPKS: Record<string, BranchComponent> = {};
  divDataSubscribtion!: Subscription;
  panelOpenState = false;
  constructor(private api: CpksChartsAndGraphsService) {}

  ngOnChanges(change: SimpleChanges) {
    if (change['division']) {
      this.getDivisionData();
    }
  }
  //??
  getDivisionData() {
    this.divDataSubscribtion = this.api
      .getCpkPerComponentMapPerDivisionV0GetCpkPerComponentMapPerDivisionGet(
        this.division
      )
      .subscribe((_) => {
        //this is annonymous -
        this.branchCPKS = _.dfs;
      });
  }
  ngOnInit() {}
  ngOnDestroy() {
    this.divDataSubscribtion.unsubscribe();
  }
  // getMaxCPK(components: BranchComponent[]): number {
  //   const maxCPK = Math.max(
  //     ...components.map((component) => component.div_data[0].component_cpk)
  //   );
  //   return maxCPK || 1; // Avoid division by zero
  // }

  // getProgressBarColor(cpk: number, components: BranchComponent[]): string {
  //   const maxCPK = this.getMaxCPK(components);
  //   const percentage = (cpk / maxCPK) * 100;
  //   if (percentage >= 75) {
  //     return 'red';
  //   } else if (percentage >= 50) {
  //     return 'yellow';
  //   } else {
  //     return 'green';
  //   }
  // }
}
