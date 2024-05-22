import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { ReportsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import {
  FormatModule,
  SelectRowModule,
  TabulatorFull as Tabulator,
  TooltipModule
} from 'tabulator-tables';
import { DownloaderService } from '../orders/downloader.service';
import { SmallFormService } from '../small-form-component/small-form.service';
import { ReportDownloaderService } from './report-downloader.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';


@Component({
  selector: 'app-report-downloads',
  templateUrl: './report-downloads.component.html',
  styleUrls: ['./report-downloads.component.scss'],
})
export class ReportDownloadsComponent {
  @ViewChild('allTypesSelected') allTypesSelected!: MatOption; // vehicle types
  @ViewChild('AllBranchSelected') AllBranchSelected!: MatOption; // branch
  @ViewChild('AllDivisionSelected') AllDivisionSelected!: MatCheckbox; // division
  @ViewChild('allSupplierSelected') allSupplierSelected!: MatOption; //supplier
  @ViewChild('allComponentsSelected') allComponentsSelected!: MatOption; //Component_map_dropdown
  @ViewChild('allSelectedVehicleMakes') allSelectedVehicleMakes!: MatOption; //vehicle make drop down
  @ViewChild('allSelectedVehicleRegs') allSelectedVehicleRegs!: MatOption; //vehicle registrations drop down
  private readonly onDestroy = new Subject<void>();
  isLoading: boolean = false;
  tableGenerated: boolean = false;
  selectedOptions: string[] = [];
  @Input() allowedDivs: any[] = [];
  @Output() selectedValues = new EventEmitter<string[]>();

  tableDataAvailable: boolean = false;
  julianToDay: any;
  julianFromDay: any;
  reportDescription: any;
  reportData: any;
  reportTable: any;
  maintenanceMaps: any;
  registrationNumbers: any;
  // shopriteAccrualReport: any;
  availableSuppliers: any;
  vehTypes: { veh_type_map: string; unit_count: number }[] = [
    { veh_type_map: '', unit_count: 0 },
  ];
  branches: any;
  form!: FormGroup;

  apiSub: any;
  selectedDivision = 'full_fleet';
  selectedBranch = 'all_branches';
  selectedVehType = 'all_vehicles';
  selectedSupplier = 'all_suppliers';
  selectedComponets = 'all_componets';
  smallform!: FormGroup;
  filteredBranches = [];
  filteredTypes = [];
  filteredModels = [];

  // allowedDivs = ['div1', 'div2', 'div3'];
  

  // allowedDivs = ['div1', 'div2', 'div3'];
  allowedBranches: any[] = [];

  fullFleetChecked = true;
  divChecked: { [key: string]: boolean } = {};

  constructor(
    public smallForm: SmallFormService,
    private gs: GlobalService,
    public route: Router,
    private dialog: MatDialog,
    private reportDownloadService: ReportDownloaderService,
    private downloader: DownloaderService,
    private fb: FormBuilder

  ) {
    Tabulator.registerModule(FormatModule);
    Tabulator.registerModule(SelectRowModule);
    Tabulator.registerModule(TooltipModule);

    // this.form = this.fb.group({
    //   fullFleet: [true], // Full Fleet is checked by default
    //   divisions: this.fb.array(
    //     this.smallForm.allowedDivs.map(() => new FormControl(false))
    //   ),
    //   branch: this.fb.control([]),
    //   vehicleType: this.fb.control([]),
    //   models: this.fb.control([])
    // });
  }

  divisions = this.smallForm.allowedDivs;
  formValues: any;
  ngOnInit() {
    // hide large form
    // this.lrgFrmService.showFormSubject.next(false);
    // hide small form
    this.gs.showSmallForm.next(true);
    this.smallForm.formLayoutType.next('full-page');
    this.smallForm.formPage = 'reports';
    this.smallForm.showAllControls();
    // hide any top rows showning
    this.gs.disableTopRows();

    //if the report should be downloaded, get report type selected from form
    this.smallForm.reportToDownload$
      // .pipe(takeUntil(this.onDestroy))
      .subscribe((reportType: string) => {
        this.callDownloadApi(reportType);
      });
    this.smallForm.initialiseForm().subscribe();
    console.log(this.smallForm.allowedDivs);
    this.fullFleetChecked = true;
    this.updateAllowedBranches(); // Initialize allowedBranches
  }

  // +++++++++++++++++++++++++++++   On All Selection Management   ++++++++++++++++++++++++++++++++++++//
  onFullFleetChange(event: any) {
    this.fullFleetChecked = event.target.checked;
    if (this.fullFleetChecked) {
      // Uncheck all division checkboxes
      this.divChecked = {};
      this.updateAllowedBranches();
    } else {
      this.allowedBranches = [];
    }
  }

  onDivisionChange(div: string, event: any) {
    this.divChecked[div] = event.target.checked;
    if (this.divChecked[div]) {
      this.fullFleetChecked = false; // Uncheck Full Fleet if any division is checked
    }
    this.updateAllowedBranches();
  }

  private updateAllowedBranches() {
    this.allowedBranches = [];
    if (this.fullFleetChecked) {
      this.smallForm.allowedDivs.forEach((division: any) => {
        this.allowedBranches.push(...division.branches);
      });
    } else {
      for (let divName in this.divChecked) {
        if (this.divChecked[divName]) {
          const division = this.smallForm.allowedDivs.find((d: any) => d.division === divName);
          if (division) {
            this.allowedBranches.push(...division.branches);
          }
        }
      }
    }
  }

  ////testing


  trackByIndex(index: number, obj: any): any {
    return index;
  }

  isChecked(division: string): boolean {
    // Only 'full_fleet' should be checked initially
    return this.smallform.get('division')?.value === 'full_fleet' && division === 'full_fleet';
  }

  onCheckboxChange(event: any, division: string): void {
    if (event.checked && division === 'full_fleet') {
      // Uncheck all other checkboxes
      this.smallForm.form.get('division')?.setValue('full_fleet');
    } else if (event.checked) {
      // Uncheck the 'Full Fleet' checkbox
      this.smallForm.form.get('division')?.setValue(division);
    } else {
      // If 'Full Fleet' checkbox is unchecked, keep it unchecked
      this.smallForm.form.get('division')?.setValue(null);
    }
  }

  // Close Dialog
  closeDialog() {
    this.dialog.closeAll();
  }

  callDownloadApi(reportType: string) {
    //get form values
    this.formValues = this.smallForm.getFormValues();

    switch (reportType) {
      case 'Fleetlist':
        this.callFleetlistApi();
        break;
      case 'Monthly Order Report':
        this.downloadMonthlyOrderReport();
        break;
      case 'Supplier/Component Report':
        this.downloadSupplierAndComponentReport();
        break;
      case 'Cost per Odo Band':
        this.downloadCostPerOdoBandandComponetReport();
        break;
      case 'trip data':
        this.callTripDataApi();
        break;
      case 'Asset Detailed - Cost':
        this.callAssetDetailedCostApi();
        break;
      case 'External Fleetlist':
        this.callExternalFleetlistApi();
        break;
       case 'LoggedIn Users Count And Time':
         this.callLoggedInUsersLogs();
         break;
      case 'shoprite checkers rebills report':
        this.callShopriteCheckersRebills();
        break;
      // shoprite vehicles service due projection report
      case 'Shoprite Service Due Projections':
        this.callShopriteCheckersRebills(); //awaiting report from wesbank
        break;
      // shoprite montly vehicles report
      case 'monthly vehicle report':
        this.callMonthlyVehiclesReportApi();
        break;
      case 'Usage Report (Summary)':
        this.callUsageSummaryReportApi();
        break;
      case 'Usage Report (Detailed)':
        this.callDetailedUsageReportApi();
        break;
      case 'Contract Usage Summary (12 Month)':
        this.callContractUsage();
        break;
      case 'Driving Events':
        this.callDrivingEvents();
        break;
      case 'Downtime':
        this.callDowntime();
        break;
      case 'Fleet Card':
        this.callFleetcard();
        break;
    }
  }

  callLoggedInUsersLogs(){
    /// get the loggedin users count and time report to be viewd only by specific users
    this.gs.showDownloadMessage()
    this.reportDownloadService.usersLogsReport(this.formValues).subscribe((blob: Blob)=>{
      this.generateReportBlob(blob, 'Users LoggedIn Count And Time Report.xlsx');
      this.gs.closeDownloadMessage()
    })
  }


  callDrivingEvents() {
    //open a snackbar that alerts that the report is being generated
    this.gs.showDownloadMessage();
    // this.reportDownloadService.getMonthlyOrderReport(this.formValues).subscribe((blob: Blob) => this.generateReportBlob(blob, 'Monthly Order Report.xlsx'));
    this.reportDownloadService
      .drivingEventsReport(this.formValues)
      .subscribe((blob: Blob) => {
        this.generateReportBlob(blob, 'Driving Events Report.xlsx');
        this.gs.closeDownloadMessage();
      });
  }

  downloadMonthlyOrderReport() {
    //open a snackbar that alerts that the report is being generated
    this.gs.showDownloadMessage();
    // this.reportDownloadService.getMonthlyOrderReport(this.formValues).subscribe((blob: Blob) => this.generateReportBlob(blob, 'Monthly Order Report.xlsx'));
    this.reportDownloadService
      .monthlyReport(this.formValues)
      .subscribe((blob: Blob) => {
        this.generateReportBlob(blob, 'Monthly Order Report.xlsx');
        this.gs.closeDownloadMessage();
      });
  }

  callDetailedUsageReportApi() {
    //open a snackbar that alerts that the report is being generated
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .detailedUsageReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Detailed Usage Report.xlsx')
      );
  }

  callUsageSummaryReportApi() {
    //open a snackbar that alerts that the report is being generated
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .usageSummaryReport(this.formValues)
      .subscribe((blob: Blob) => {
        this.generateReportBlob(blob, 'Usage Summary Report.xlsx');
        this.gs.closeDownloadMessage();
      });
  }

  downloadCostPerOdoBandandComponetReport() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .odoBandPerComponentReport(this.formValues)
      .subscribe((blob: Blob) => {
        this.generateReportBlob(blob, 'Cost per Odo Band.xlsx');
        this.gs.closeDownloadMessage();
      });
  }

  //get supplier invoice reports
  downloadSupplierAndComponentReport() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .supplierComponentReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Supplier Component Report.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  callComponentCostApi() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .supplierComponentReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Component Reports.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  // check trip data report in the download service
  callTripDataApi() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .tripDataReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Daily Trip Data Report.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  //get month vehicles report
  callMonthlyVehiclesReportApi() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .monthlyVehicleReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Monthly Vehicle Report.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  callAssetDetailedCostApi() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .assetsDetailsReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Assets Details Repost.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  callExternalFleetlistApi() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .externalFleetlistReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'external Fleetlist Report.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  //shoprite checkers rebills reports
  callShopriteCheckersRebills() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .shopriteCheckersReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Shoprite Checkers Report.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  callDowntime() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .downtimeReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Downtime Report.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  callFleetcard() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .fleetcardReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Fleet Card Report.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  callContractUsage() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .contractUsageTwelveMonthReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Contract Usage Summary.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  //fleetlist report
  callFleetlistApi() {
    this.gs.showDownloadMessage();
    this.reportDownloadService
      .fleetlistReport(this.formValues)
      .subscribe((blob: Blob) =>
        this.generateReportBlob(blob, 'Fleetlist.xlsx')
      );
    this.gs.closeDownloadMessage();
  }

  //generate table for a selected report type
  generateTable() {
    const tableColumns = Object.keys(this.reportData[0]).map((key) => {
      return { title: key, field: key };
    });
    this.reportTable = new Tabulator('#tabulator-table', {
      columns: tableColumns,
      data: this.reportData,
      // layout: 'fitColumns',
      pagination: true,
      paginationSize: 50,
      paginationSizeSelector: [20, 50, 100],
      paginationInitialPage: 1,
      selectable: true,
    });
    this.tableDataAvailable = true;
  }

  download() {
    this.downloader.downloadXLS(this.smallForm).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `${this.reportDescription}.xls`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  generateReportBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
    //form is set specially for this page, on destroy reset form to compact and general
    this.smallForm.formPage = 'general';
    this.smallForm.formLayoutType.next('compact');
  }

  // onCheckboxChange(event: any) {
  //   const value = event.target.value;
  //   if (event.target.checked) {
  //     this.selectedOptions.push(value);
  //   } else {
  //     this.selectedOptions = this.selectedOptions.filter(option => option !== value);
  //   }
  //   this.selectedValues.emit(this.selectedOptions);
  // }

  onAllTypesSelected() {
    if (this.allTypesSelected.selected) {
      this.smallForm.form.controls['vehicleType'].patchValue(['all_veh_types']);
    }
  }

  onTypeSelected() {
    if (this.allTypesSelected.selected) {
      this.allTypesSelected.deselect();
    }
  }

  onAllDivisionSelected() {
    if (this.AllDivisionSelected.checked) {
      this.smallForm.form.controls['division'].setValue(['full_fleet']);
    }
  }

  onDivisionSelected() {
    if (this.AllDivisionSelected.checked) {
      this.AllDivisionSelected.setDisabledState(true);
    }
  }

  onAllBranchSelected() {
    if (this.AllBranchSelected.selected) {
      this.smallForm.form.controls['branch'].patchValue(['all_branches']);
    }
  }

  onBranchSelected() {
    if (
      this.AllBranchSelected.selected &&
      this.smallForm.formPage != 'orders'
    ) {
      this.AllBranchSelected.deselect();
    }
  }

  onAllSupplierSelected() {
    if (this.allSupplierSelected.selected) {
      this.smallForm.form.controls['supplier'].patchValue(['all_suppliers']);
    }
  }

  onSupplierSelected() {
    if (this.allSupplierSelected.selected) {
      this.allSupplierSelected.deselect();
    }
  }

  onAllComponentsSelected() {
    if (this.allComponentsSelected.selected) {
      this.smallForm.form.controls['components'].patchValue([
        'veh_model_map',
      ]);
    }
  }

  onComponentsSelected() {
    this.allComponentsSelected.deselect();
  }

  onAllVehicleMakeSelected() {
    if (this.allSelectedVehicleMakes.selected) {
      this.smallForm.form.controls['veh_model_map'].patchValue([...this.smallForm.allowedRepairMaps]);
    } else {
      this.smallForm.form.controls['veh_model_map'].patchValue([]);
    }
  }

  onVehicleMakeSelected() {
    this.allSelectedVehicleMakes.deselect();
  }

  /// vehicle registration drop down 
  onAllVehicleRegsSelected() {
    if (this.allSelectedVehicleRegs.selected) {
      this.smallForm.form.controls['registrations'].patchValue([...this.smallForm.allowedVehicles]);
    } else {
      this.smallForm.form.controls['registrations'].patchValue([]);
    }
  }
  
  onVehicleRegSelected() {
    this.allSelectedVehicleRegs.deselect();
  }
}
