import { Component, Input, SimpleChanges } from '@angular/core';

import { Subscription } from 'rxjs';
import { CpksChartsAndGraphsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import {
  vehicle_costs_ranked,
  vehicle_distance_ranked,
} from 'src/app/interfaces.interrface';
import { asset } from '../../models/asset.interface';

@Component({
  selector: 'app-per-asset-heading',
  templateUrl: './per-asset-heading.component.html',
  styleUrls: ['./per-asset-heading.component.scss'],
})
export class PerAssetHeadingComponent {
  constructor(
    private api: CpksChartsAndGraphsService,
    private gs: GlobalService
  ) {}
  assetFleetlistSub?: Subscription;
  rankedList: any;
  assetRatings: any;
  totalCostsAndCPKsPodium?: any;
  assetImgPath: string = '';
  vehicles: any = {
    name: '',
  };
  @Input() assetInfo: asset = {
    branch: '',
    chassis_no: '',
    client_acc_no: '',
    client_name: '',
    contract_mileage: 0,
    contract_type: '',
    date_of_first_reg: '',
    deal_number: 0,
    description: '',
    fleet_list_date: '',
    last_known_odo: '',
    maint_plan_cost: '',
    make: '',
    map: '',
    mm_code: '',
    months_remaining: 0,
    new_used: '',
    pass_comm: '',
    truck_trailer: '',
    veh_model_map: '',
    veh_type_map: '',
    vehicle_cat: '',
    vehiclereg: '',
  };
  getRankedCostsSub?: Subscription;
  getRankedDistancesSub?: Subscription;

  assetFound = true;
  vehicleDistance?: vehicle_distance_ranked;
  vehicleCosts?: vehicle_costs_ranked;

  ngOnChanges(change: SimpleChanges) {
    if (change['assetInfo'] && change['assetInfo'].currentValue['vehiclereg']) {
      const vehiclereg = this.assetInfo.vehiclereg;

      const veh_model_map = this.assetInfo.veh_model_map;
      const imgName = veh_model_map.replace(/\//g, '');

      this.assetImgPath = `assets/vehicles/${imgName}.png`;

      this.getRankedCostsSub = this.api
        .getRankedComponentCpksPerModelV0GetCpkAndCostsRankedPerComponentForAModelGet(
          veh_model_map,
          vehiclereg
        )
        .subscribe({
          next: ([totalCostAndCPKRatings, rankedList]) => {
            this.updateAssetCostPodiums(totalCostAndCPKRatings);
            this.rankedList = rankedList;
          },
          error: (err: any) => {
            this.gs.raiseError(err);
          },
          complete() {},
        });

      // this.getRankedCostsSub = this.apiService. /// (veh_model_map).subscribe(
      //   (vehicleCosts) =>  {
      //     this.vehicleCosts = vehicleCosts;
      //
      //   }
      // )

      // this.getRankedDistancesSub = this.apiService
      //   .getRankedDistancesV0GetDistancesRankedGet(veh_model_map, vehiclereg)
      //   .subscribe((vehicleDistance) => {
      //     this.vehicleDistance = vehicleDistance;
      //
      //   });
    }
  }

  updateAssetCostPodiums(totalCostAndCPKRatings: any) {
    this.totalCostsAndCPKsPodium = totalCostAndCPKRatings;
  }
  // getAssetDetails(assetID: string) {
  //   this.assetFleetlistSub = this.apiService
  //     .getPerAssetFleetlistDetailsV0PerassetdetailsGet(assetID)
  //     .subscribe((assetInfo) => {
  //       this.assetInfo = assetInfo[0];
  //       this.assetFound = true ? this.assetInfo != this.assetInfo : false;
  //
  //     });
  // }
  ngOnDestroy() {
    this.getRankedCostsSub?.unsubscribe();
  }
}
