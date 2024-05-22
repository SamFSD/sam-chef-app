import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ExpirationsService } from 'src/app/core/api/api_service';
import { SmallFormService } from 'src/app/features/home/small-form-component/small-form.service';
import { CellComponent, TabulatorFull as Tabulator } from 'tabulator-tables';

@Component({
  selector: 'app-expirations-popu-table',
  templateUrl: './expirations-popu-table.component.html',
  styleUrls: ['./expirations-popu-table.component.scss'],
})
export class ExpirationsPopuTableComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ExpirationsService,
    private smallForm: SmallFormService,
    private router: Router,
  ) {}

  formValues: any;
  popupTitle: string = '';
  isoDateString: any;
  vehContrExpTable: any;
  vehContrExpTableData: any[] = [];
  vehLicExpTable: any;
  vehLicExpTableData: any[] = [];
  licenseColumns: any[] = [
    {
      title: '',
      field: 'action',
      formatter: this.customButtonFormatter,
      formatterParams: { icon: 'search' },
      cellClick: (e: Event, cell: CellComponent) => {
        // Call your function here
        this.onButtonClick(cell.getRow().getData());
      },
      headerSort: false,
      width: 20,
      hozAlign: 'center',
      
    },
    { title: 'Vehicle Reg', field: 'vehiclereg' },
    { title: 'Division', field: 'division' },
    { title: 'Branch', field: 'branch' },
    { title: 'Veh Type Map', field: 'veh_type_map' },
    { title: 'Vehicle Lic Exp', field: 'veh_lic_exp' },
  ];
  expColumns: any[] = [
    {
      title: '',
      field: 'action',
      formatter: this.customButtonFormatter,
      formatterParams: { icon: 'search' },
      cellClick: (e: Event, cell: CellComponent) => {
        // Call your function here
        this.onButtonClick(cell.getRow().getData());
      },
      headerSort: false,
      width: 20,
      hozAlign: 'center',
      
    },
    { title: 'Vehicle Reg', field: 'vehiclereg' },
    { title: 'Division', field: 'division' },
    { title: 'Veh Type Map', field: 'veh_type_map' },
    { title: 'Month Remaining', field: 'months_remaining' },
    { title: 'Start Date', field: 'contract_start' },
    { title: 'End Date', field: 'contract_end' },
  ];
  ngOnInit() {
    //get div, branch, type from form
    this.formValues = this.smallForm.getFormValues();
    //format date of month for query

    if (this.data.month != 'Expired') {
      const parsedDate = new Date(this.data.month);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth() + 1; // Month is zero-based, so add 1
      const day = '01'; // You want the first day of the month

      // Create the ISO date string 'YYYY-MM-DD'
      this.isoDateString = `${year}-${month
        .toString()
        .padStart(2, '0')}-${day}`; //use this for queries where we need expirations in a spcific month
    } else {
      this.isoDateString = this.data.month;
    }


    if (this.data.popuptype === 'license') {
      this.popupTitle = `License Expirations - ${this.data.month}`;
      this.callLicApi();
    }

    if (this.data.popuptype === 'contract') {
      this.popupTitle = `Contract Expirations - ${this.data.month}`;
      this.callContractApi();
    }
  }

  callLicApi() {
    this.api
      .getVehicleLicenceCountTableV0GetVehicleLicenceCountTablePost(
        this.formValues
      )
      .subscribe((res: any) => {
        this.generateLicenseTable(res);
      });
  }

  callContractApi() {
    this.api
      .getVehicleContractTableV0GetVehicleContractTablePost(this.formValues)
      .subscribe((res: any) => {
        this.generateExpirationsTable(res);
      });
  }

  generateExpirationsTable(formData: any) {
    //expirations table
    this.vehContrExpTable = new Tabulator('#expirations-popup-table', {
      // height: "511px",
      layout: 'fitColumns',
      data: formData,
      renderHorizontal: 'virtual',
      columns: this.expColumns,
      pagination: true,
      paginationSize: 20,
      paginationSizeSelector: [20, 50, 100],
      paginationInitialPage: 1,
      selectable: true,
    });
  }

  generateLicenseTable(formData: any) {
    this.vehLicExpTable = new Tabulator('#expirations-popup-table', {
      // height: "511px",
      layout: 'fitColumns',
      data: formData,
      renderHorizontal: 'virtual',
      columns: this.licenseColumns,
      pagination: true,
      paginationSize: 20,
      paginationSizeSelector: [20, 50, 100],
      paginationInitialPage: 1,
      selectable: true,
    });
  }
  onButtonClick(rowData: any) {
    this.smallForm.patchPavReg(rowData.vehiclereg)
    this.router.navigate(['/viewasset'])
  }

  customButtonFormatter(cell: CellComponent, formatterParams: any, onRendered: () => void): string {
    const icon = formatterParams.icon || '';
    return `<div style="font-size: 14px;" class="material-icons">${icon}</div>`;
  }
}
