import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';
import { CpksChartsAndGraphsService } from 'src/app/core/api/api_service';

@Component({
  selector: 'app-branch-holder',
  templateUrl: './branch-holder.component.html',
  styleUrls: ['./branch-holder.component.scss'],
})
export class BranchHolderComponent {
  @Input() division: string = '';
  @Input() branch: string = '';
  branchOrDivTitle?: string;
  topAssetsCPKs?: any;
  botAssetsCPKs?: any;
  topAssetsCosts?: any;
  botAssetsCosts?: any;
  topAssetsDistances?: any;
  botAssetsDistances?: any;
  topAssetsContractExpirey?: any;
  botAssetsContractExpirey?: any;
  topAssetsVehLicExpirey?: any;
  botAssetsVehLicExpirey?: any;
  divisionTotals: any[] = ['', '', '', '', '', '', ''];
  panelOpenState: boolean = false;
  cpkTotalsSub!: Subscription;
  constructor(
    public apiService: CpksChartsAndGraphsService,
    public dialog: MatDialog
  ) {}
  ngOnInit() {
    if (this.division) {
      this.cpkTotalsSub = this.apiService
        .getCpkTotalsRankerV0GetCpkTotalsRankerGet(this.division)
        .subscribe((response) => {
          this.setValues(this.division, response);
        });
    }
    if (this.branch) {
      this.cpkTotalsSub = this.apiService
        .getCpkTotalsRankerV0GetCpkTotalsRankerBranchGet(this.branch)
        .subscribe((response) => {
          this.setValues(this.branch, response);
        });
    }
  }

  ngOnDestroy() {
    this.cpkTotalsSub.unsubscribe();
  }

  setValues(branchOrDivTitle: any, response: any) {
    this.branchOrDivTitle = branchOrDivTitle;
    this.topAssetsCPKs = response.top_cpk;
    this.topAssetsCosts = response.top_costs.slice(0, 3);
    this.botAssetsCosts = response.top_costs.slice(-4, -1);
    this.topAssetsDistances = response.top_distances.slice(0, 3);
    this.botAssetsDistances = response.top_distances.slice(-4, -1);
    this.topAssetsContractExpirey = response.top_contract_exp.slice(0, 3);
    this.botAssetsContractExpirey = response.top_contract_exp.slice(-4, -1);
    this.topAssetsVehLicExpirey = response.top_lic_expirey.slice(0, 3);
    this.botAssetsVehLicExpirey = response.top_lic_expirey.slice(-4, -1);
    this.divisionTotals = response.division_totals;
  }
}
