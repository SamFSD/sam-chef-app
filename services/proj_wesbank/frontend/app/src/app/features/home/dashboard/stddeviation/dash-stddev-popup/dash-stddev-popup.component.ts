import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../../small-form-component/small-form.service';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dash-stddev-popup',
  templateUrl: './dash-stddev-popup.component.html',
  styleUrls: ['./dash-stddev-popup.component.scss'],
})
export class DashStddevPopupComponent {
  constructor(
    private gs: GlobalService,
    private smallForm: SmallFormService,
    private router: Router,
    private dialogRef: MatDialogRef<DashStddevPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  vehicleCost: any;
  avgModelCost: any;
  avgTypeCost: any;
  vehicleTransactions: any;
  avgModelTransactions: any;
  avgTypeTransactions: any;

  modelCostComp!: string;
  modelCostCompPercent: any;
  modelTransComp!: string;
  modelTransCompPercent: any;
  typeCostComp!: string;
  typeCostCompPercent: any;
  typeTransComp!: string;
  typeTransCompPercent: any;

  ngOnInit() {
    this.vehicleCost = this.gs.toZAR(this.data.row.sum);
    this.avgModelCost = this.gs.toZAR(this.data.row.amount_pm);
    this.avgTypeCost = this.gs.toZAR(this.data.row.amount_pm_type);
    this.vehicleTransactions = this.data.row.count;
    this.avgModelTransactions = this.data.row.transactions.toFixed(2);
    this.avgTypeTransactions = this.data.row.transactions_type.toFixed(2);

    if (this.data.row.sum > this.data.row.amount_pm) {
      this.modelCostComp = 'greater';
      this.modelCostCompPercent = (
        ((this.data.row.sum - this.data.row.amount_pm) / this.data.row.sum) *
        100
      ).toFixed(2);
    } else {
      this.modelCostComp = 'less';
      this.modelCostCompPercent = (
        ((this.data.row.amount_pm - this.data.row.sum) /
          this.data.row.amount_pm) *
        100
      ).toFixed(2);
    }
    if (this.data.row.count > this.data.row.transactions) {
      this.modelTransComp = 'more';
      this.modelTransCompPercent = (
        ((this.data.row.count - this.data.row.transactions) /
          this.data.row.count) *
        100
      ).toFixed(2);
    } else {
      this.modelTransComp = 'fewer';
      this.modelTransCompPercent = (
        ((this.data.row.transactions - this.data.row.count) /
          this.data.row.transactions) *
        100
      ).toFixed(2);
    }
    if (this.data.row.sum > this.data.row.amount_pm_type) {
      this.typeCostComp = 'greater';
      this.typeCostCompPercent = (
        ((this.data.row.sum - this.data.row.amount_pm_type) /
          this.data.row.sum) *
        100
      ).toFixed(2);
    } else {
      this.typeCostComp = 'less';
      this.typeCostCompPercent = (
        ((this.data.row.amount_pm_type - this.data.row.sum) /
          this.data.row.amount_pm_type) *
        100
      ).toFixed(2);
    }
    if (this.data.row.count > this.data.row.transactions_type) {
      this.typeTransComp = 'more';
      this.typeTransCompPercent = (
        ((this.data.row.count - this.data.row.transactions_type) /
          this.data.row.count) *
        100
      ).toFixed(2);
    } else {
      this.typeTransComp = 'fewer';
      this.typeTransCompPercent = (
        ((this.data.row.transactions_type - this.data.row.count) /
          this.data.row.transactions_type) *
        100
      ).toFixed(2);
    }
  }
  onViewAssetClick() {
    this.smallForm.patchPavReg(this.data.row.reg);
    this.dialogRef.close();
    this.router.navigate(['/viewasset']);
  }
}
