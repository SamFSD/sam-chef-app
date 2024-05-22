import { Component, ViewChild } from '@angular/core';
import { SmallFormService } from '../small-form-component/small-form.service';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Grid } from 'ag-grid-community';
import { GlobalService } from 'src/app/core/services/global.service';
import { DtPopupComponent } from './dt-popup/dt-popup.component';
import { DowntimeTrackerService } from 'src/app/core/api/api_service';
import { AgGridAngular } from 'ag-grid-angular';
import { DtEndPopupComponent } from './dt-end-popup/dt-end-popup.component';

@Component({
  selector: 'app-downtime',
  templateUrl: './downtime.component.html',
  styleUrls: ['./downtime.component.scss'],
})
export class DowntimeComponent {
  @ViewChild('agGrid', { static: false }) agGrid!: AgGridAngular;
  private readonly onDestroy = new Subject<void>();
  columnDefs!: any[];
  gridOptions: any;
  selectedBranch!: any;
  gridData!: any;
  isLoading: boolean = true;
  selectedRowData: any;

  constructor(
    public smallForm: SmallFormService,
    private dialog: MatDialog,
    private gs: GlobalService,
    private api: DowntimeTrackerService
  ) {}
  ngOnInit() {
    this.gs.disableTopRows();
    this.smallForm.formPage = 'downtime';
    this.smallForm.formLayoutType.next('full-page');

    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });

    this.smallForm.dtButtonClicked.subscribe((buttonValue: string) => {
      if (buttonValue) {
        switch (buttonValue) {
          case 'add':
            this.onAddButtonClick();
            break;
          case 'edit':
            this.onEditButtonClick();
            break;
          case 'complete':
            this.onCompleteClick();
        }
      }
    });

    this.columnDefs = [
      {
        headerName: 'Fleet No.',
        field: 'fleet_no',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Vehicle Reg',
        field: 'vehiclereg',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Status',
        field: 'status',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Dispatch Date',
        field: 'start_date',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Expected Return Date',
        field: 'est_end_date',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Return Date',
        field: 'end_date',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Downtime (days)',
        field: 'downtime',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Expected Time Remaining',
        field: 'remaining',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Reason',
        field: 'reason',
        filter: 'agTextColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Service Provider',
        field: 'supplier',
        filter: 'agTextColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Type',
        field: 'type',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Make',
        field: 'make',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Model',
        field: 'model',
        filter: 'agTextColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'Odo',
        field: 'odo',
        filter: 'agNumberColumnFilter',
        sortable: true,
        width: 'auto',
      },
      {
        headerName: 'uid',
        field: 'uid',
        hide: true,
      },
    ];
  }

  callApi(formValues: any) {
    this.isLoading = true;
    this.api
      .getDtGridV0GetDtGridPost(formValues)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((data: any) => {
        this.gridData = data;
        this.selectedBranch = formValues.branch_single.branch;
        this.isLoading = false;
      });
  }

  onAddButtonClick() {
    const dtForm = this.dialog.open(DtPopupComponent, {
      data: {
        isEditMode: false,
        selectedBranch: this.selectedBranch,
      },
    });
    dtForm
      .afterClosed()
      .subscribe(() => this.callApi(this.smallForm.getFormValues()));
    this.gridOptions.api.setRowData(this.gridData);
  }

  onEditButtonClick() {
    const dtForm = this.dialog.open(DtPopupComponent, {
      data: {
        isEditMode: true,
        selectedBranch: this.selectedBranch,
        selectedRowData: this.selectedRowData,
      },
    });
    dtForm
      .afterClosed()
      .subscribe(() => this.callApi(this.smallForm.getFormValues()));
    this.gridOptions.api.setRowData(this.gridData);
  }

  onCompleteClick() {
    const endForm = this.dialog.open(DtEndPopupComponent, {
      data: {
        uid: this.selectedRowData.uid,
        vehiclereg: this.selectedRowData.vehiclereg,
        fleet_no: this.selectedRowData.fleet_no,
      },
    });
    endForm
      .afterClosed()
      .subscribe(() => this.callApi(this.smallForm.getFormValues()));
    this.gridOptions.api.setRowData(this.gridData);
  }

  onRowClick() {
    this.selectedRowData = this.agGrid.api.getSelectedRows()[0];
    this.smallForm.dtSelectButtonsEnabled = true;
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
