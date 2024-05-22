import { Component, Input } from '@angular/core';
import { CpksChartsAndGraphsService } from 'src/app/core/api/api_service';

@Component({
  selector: 'app-cpk-model-ranker',
  templateUrl: './cpk-model-ranker.component.html',
  styleUrls: ['./cpk-model-ranker.component.scss'],
})
export class CpkModelRankerComponent {
  @Input() division?: string;
  @Input() branch?: string;
  topAssets?: any;
  botAssets?: any;
  apiSub: any;
  constructor(public apiService: CpksChartsAndGraphsService) {}

  ngOnInit() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
    if (this.division) {
      this.apiSub = this.apiService
        .getCpksPerModelRankerV0GetCpkPerModelGet(this.division, 3)
        .subscribe((response) => {
          this.setData(response);
        });
    }
    if (this.branch) {
      this.apiSub = this.apiService
        .getCpksPerModelBranchRankerV0GetCpkPerModelBranchGet(this.branch, 3)
        .subscribe((response) => {
          this.setData(response);
        });
    }
  }
  setData(response: any) {
    this.topAssets = response.top_cpk;
    this.botAssets = response.bottom_cpk;
  }

  ngOnDestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }
}
