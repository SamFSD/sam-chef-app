import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { ReportsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import {
  TabulatorFull as Tabulator
} from 'tabulator-tables';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { DownloaderService } from 'src/app/features/home/orders/downloader.service';
import { ReportDownloaderService } from 'src/app/features/home/report-downloads/report-downloader.service';
import { SmallFormService } from 'src/app/features/home/small-form-component/small-form.service';


@Component({
  selector: 'app-filter-form',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.scss'],
})
export class FilterFormComponent {
  @ViewChild('allTypesSelected') allTypesSelected!: ElementRef; // vehicle types
  @ViewChild('AllBranchSelected') AllBranchSelected!: ElementRef; // branch
  @ViewChild('AllDivisionSelected') AllDivisionSelected!: ElementRef; // division
  @ViewChild('allSupplierSelected') allSupplierSelected!: ElementRef; //supplier
  @ViewChild('allComponentsSelected') allComponentsSelected!: ElementRef; //Component_map_dropdown
  @ViewChild('allSelectedVehicleMakes') allSelectedVehicleMakes!: ElementRef; //vehicle make drop down
  @ViewChild('allSelectedVehicleRegs') allSelectedVehicleRegs!: ElementRef; //vehicle registrations drop down

  allBranchSelected = true;

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
  viewMultiSelect: boolean = false;
  isViewMultiSelect: boolean = false;

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
 
  }

  divisions = [];
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
    this.divisions = this.smallForm.allowedDivs;
    // this.allowedBranches = this.smallForm.allowedBranches;
    console.log(this.allowedBranches);
    this.fullFleetChecked = true;
    // this.updateAllowedBranches(); // Initialize allowedBranches
    console.log("Is Multi Select View: ", this.isViewMultiSelect);
    this.initializeCheckedStates();
  }

  // Toogle Multi and Single select
  onSelectModeToggle() {
    this.viewMultiSelect = !this.viewMultiSelect;
    console.log(this.viewMultiSelect);
    // if (this.isViewMultiSelect) {
    //   this.viewMultiSelect = !this.viewMultiSelect;
    // } else {
    //   this.viewMultiSelect = false
    // }
  }

  // +++++++++++++++++++++++++++++   On All Selection Management   ++++++++++++++++++++++++++++++++++++//
  onFullFleetChange(event: any) {
      this.fullFleetChecked = event.target.checked;
      if (this.fullFleetChecked) {
        // Uncheck all division checkboxes
        this.divChecked = {};
        this.smallForm.form.controls['branch'].setValue(['all_branches']);
        this.updateAllowedBranches();
      } else {
        this.allowedBranches = [];
      }
    this.onAllDivisionSelected();
  }

  onDivisionChange(div: string, event: any) {
    this.divChecked[div] = event.target.checked;
    
    if (this.divChecked[div]) {
      this.fullFleetChecked = false; // Uncheck Full Fleet if any division is checked
      
      console.log("We're here: ", this.smallForm.form.controls['division'].getRawValue());
      console.log("Current Branches: ", this.smallForm.allowedBranches);
      if(this.smallForm.allowedBranches.length !== 0) {
        this.smallForm.allowedBranches = [];
        this.allowedBranches = this.smallForm.allowedBranches.filter((branch: any) => {
          branch.division = div;
        });
        console.log(this.allowedBranches);
      }
      // this.smallForm.setBranchesOnDivisionChange();
      
    }
    
    this.updateAllowedBranches();
  }

  private updateAllowedBranches() {
    if (this.divisions && this.fullFleetChecked) {
      this.allBranchSelected = false;
    }

    // this.allowedBranches = [];
    // if (this.fullFleetChecked) {
    //   this.divisions.forEach((division: any) => {
    //     this.allowedBranches.push(...this.smallForm.allowedBranches);
    //   });
    // } else {
    //   for (let divName in this.divChecked) {
    //     if (this.divChecked[divName]) {
    //       const division = this.divisions.find(
    //         (d: any) => d.division === divName
    //       );
    //       if (division) {
    //         this.allowedBranches.push(...this.smallForm.allowedBranches);
    //         console.log(this.allowedBranches);
    //       }
    //     }
    //   }
    // }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  isChecked(division: string): boolean {
    // Only 'full_fleet' should be checked initially
    return (
      this.smallform.get('division')?.value === 'full_fleet' &&
      division === 'full_fleet'
    );
  }

  initializeCheckedStates() {
    // Initialize divChecked object based on your data
    // Example:
    this.divChecked['full_fleet'] = false;
    this.divChecked['all_branches'] = false;
    this.divChecked['all_veh_types'] = false;
    this.divChecked['all_models'] = false;
    this.divChecked['all_registrations'] = false;
    this.divChecked['all_suppliers'] = false;

    // Initialize based on allowedDivs, allowedBranches, etc.
    this.smallForm.allowedDivs.forEach((div: any) => this.divChecked[div.division] = false);
    this.smallForm.allowedBranches.forEach((branch: any) => this.divChecked[branch.branch] = false);
    this.smallForm.allowedVehTypes.forEach((type: any) => this.divChecked[type] = false);
    this.smallForm.allowedModelTypes.forEach((model: any) => this.divChecked[model.veh_model_map] = false);
    this.smallForm.allowedVehicles.forEach((vehicle: any) => this.divChecked[vehicle.fleet_no + ' (' + vehicle.vehiclereg + ')'] = false);
    this.smallForm.allowedSuppliers.forEach((supplier: any) => this.divChecked[supplier.supplier] = false);
  }

  // On checkboxes clicked
  onCheckboxChange(event: any, division: string): void {
    this.divChecked[division] = event.target.checked;
    const input = event.target as HTMLInputElement;
    this.divChecked[division] = input.checked;
    if (event.target.checked && division === 'full_fleet') {
      // Uncheck all other checkboxes
      this.smallForm.form.get('division')?.setValue('full_fleet');
      console.log(division);
    } else if (event.target.checked) {
      // Uncheck the 'Full Fleet' checkbox
      this.smallForm.form.get('division')?.setValue(division);
    console.log(division);
    } else {
      // If 'Full Fleet' checkbox is unchecked, keep it unchecked
      this.smallForm.form.get('division')?.setValue(null);
    }
  }

  onBranchCheckboxChange(event: any, branch: string): void {
    this.divChecked[branch] = event.target.checked;
    const input = event.target as HTMLInputElement;
    this.divChecked[branch] = input.checked;
    if (event.target.checked && branch === 'all_branches') {
      // Uncheck all other checkboxes
      this.smallForm.form.get('branch')?.setValue('all_branches');
      console.log(branch);
    } else if (event.target.checked) {
      // Uncheck the 'Full Fleet' checkbox
      this.smallForm.form.get('branch')?.setValue(branch);
    console.log(branch);
    } else {
      // If 'Full Fleet' checkbox is unchecked, keep it unchecked
      this.smallForm.form.get('branch')?.setValue(null);
    }
  }

  onTypeCheckboxChange(event: any, type: string): void {
    this.divChecked[type] = event.target.checked;
    const input = event.target as HTMLInputElement;
    this.divChecked[type] = input.checked;
    if (event.target.checked && type === 'all_veh_types') {
      // Uncheck all other checkboxes
      this.smallForm.form.get('type')?.setValue('all_veh_types');
      console.log(type);
    } else if (event.target.checked) {
      // Uncheck the 'Full Fleet' checkbox
      this.smallForm.form.get('type')?.setValue(type);
    console.log(type);
    } else {
      // If 'Full Fleet' checkbox is unchecked, keep it unchecked
      this.smallForm.form.get('type')?.setValue(null);
    }
  }

  onModelsCheckboxChange(event: any, model: string): void {
    this.divChecked[model] = event.target.checked;
    const input = event.target as HTMLInputElement;
    this.divChecked[model] = input.checked;
    if (event.target.checked && model === 'all_models') {
      // Uncheck all other checkboxes
      this.smallForm.form.get('model')?.setValue('all_models');
      console.log(model);
    } else if (event.target.checked) {
      // Uncheck the 'Full Fleet' checkbox
      this.smallForm.form.get('model')?.setValue(model);
    console.log(model);
    } else {
      // If 'Full Fleet' checkbox is unchecked, keep it unchecked
      this.smallForm.form.get('model')?.setValue(null);
    }
  }

  onAssetsCheckboxChange(event: any, asset: string): void {
    this.divChecked[asset] = event.target.checked;
    const input = event.target as HTMLInputElement;
    this.divChecked[asset] = input.checked;
    if (event.target.checked && asset === 'all_registrations') {
      this.smallForm.form.get('asset')?.setValue('all_registrations');
      console.log(asset);
    } else if (event.target.checked) {
      this.smallForm.form.get('asset')?.setValue(asset);
    console.log(asset);
    } else {
      this.smallForm.form.get('asset')?.setValue(null);
    }
  }

  onSupplierCheckboxChange(event: any, supplier: string): void {
    this.divChecked[supplier] = event.target.checked;
    const input = event.target as HTMLInputElement;
    this.divChecked[supplier] = input.checked;
    if (event.target.checked && supplier === 'all_suppliers') {
      this.smallForm.form.get('supplier')?.setValue('all_suppliers');
      console.log(supplier);
    } else if (event.target.checked) {
      this.smallForm.form.get('supplier')?.setValue(supplier);
    console.log(supplier);
    } else {
      this.smallForm.form.get('supplier')?.setValue(null);
    }
  }

  onComponentCheckboxChange(event: any, component: string): void {
    this.divChecked[component] = event.target.checked;
    const input = event.target as HTMLInputElement;
    this.divChecked[component] = input.checked;
    if (event.target.checked && component === 'all_repair_maps') {
      // Uncheck all other checkboxes
      this.smallForm.form.get('component')?.setValue('all_repair_maps');
      console.log(component);
    } else if (event.target.checked) {
      // Uncheck the 'Full Fleet' checkbox
      this.smallForm.form.get('component')?.setValue(component);
    console.log(component);
    } else {
      this.smallForm.form.get('component')?.setValue(null);
    }
  }
  // On checkboxes clicked

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

  // onAllTypesSelected() {
  //   if (this.allTypesSelected.checked) {
  //     this.smallForm.form.controls['vehicleType'].patchValue(['all_veh_types']);
  //   }
  // }

  // onTypeSelected() {
  //   if (this.allTypesSelected.selected) {
  //     this.allTypesSelected.deselect();
  //   }
  // }

  onAllDivisionSelected() {
    const checkbox = this.AllDivisionSelected.nativeElement as HTMLInputElement;
    if (checkbox.checked) {
      this.smallForm.form.controls['division'].setValue(['full_fleet']);
      this.divChecked = {};
      this.smallForm.form.controls['branch'].setValue(['all_branches']);
      this.updateAllowedBranches();
    } else {
      this.smallForm.form.controls['division'].setValue([]);
    }
  }

  onDivisionSelected() {
    const checkbox = this.AllDivisionSelected.nativeElement as HTMLInputElement;
    if (checkbox.checked) {
      this.fullFleetChecked = false
    }
  }

  // onAllBranchSelected() {
  //   if (this.allBranchSelected.selected) {
  //     this.smallForm.form.controls['branch'].patchValue(['all_branches']);
  //   }
  // }

  // onBranchSelected() {
  //   if (this.allBranchSelected.checked && this.smallForm.formPage != 'orders') {
  //     this.allBranchSelected = false;
  //   }
  // }

  // onAllSupplierSelected() {
  //   if (this.allSupplierSelected.selected) {
  //     this.smallForm.form.controls['supplier'].patchValue(['all_suppliers']);
  //   }
  // }

  // onSupplierSelected() {
  //   if (this.allSupplierSelected.selected) {
  //     this.allSupplierSelected.deselect();
  //   }
  // }

  // onAllComponentsSelected() {
  //   if (this.allComponentsSelected.selected) {
  //     this.smallForm.form.controls['components'].patchValue(['veh_model_map']);
  //   }
  // }

  // onComponentsSelected() {
  //   this.allComponentsSelected.deselect();
  // }

  // onAllVehicleMakeSelected() {
  //   if (this.allSelectedVehicleMakes.selected) {
  //     this.smallForm.form.controls['veh_model_map'].patchValue([
  //       ...this.smallForm.allowedRepairMaps,
  //     ]);
  //   } else {
  //     this.smallForm.form.controls['veh_model_map'].patchValue([]);
  //   }
  // }

  // onVehicleMakeSelected() {
  //   this.allSelectedVehicleMakes.deselect();
  // }

  // /// vehicle registration drop down
  // onAllVehicleRegsSelected() {
  //   if (this.allSelectedVehicleRegs.selected) {
  //     this.smallForm.form.controls['registrations'].patchValue([
  //       ...this.smallForm.allowedVehicles,
  //     ]);
  //   } else {
  //     this.smallForm.form.controls['registrations'].patchValue([]);
  //   }
  // }

  // onVehicleRegSelected() {
  //   this.allSelectedVehicleRegs.deselect();
  // }
}