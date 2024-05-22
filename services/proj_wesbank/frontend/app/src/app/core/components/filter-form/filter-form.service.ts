import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '@auth0/auth0-angular';
import {
  BehaviorSubject,
  Subject,
  catchError,
  forkJoin,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import {
  DateManagementService,
  UserPermissionsService,
} from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { MonthpickerService } from 'src/app/features/home/small-form-component/monthpicker/monthpicker.service';
import { environment } from 'src/environments/environment.prod';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

declare var gtag: Function;

// the commands the order buttons can send to order component
type OrderButtonCommand =
  | 'edit'
  | 'delete'
  | 'create'
  | 'view_asset'
  | 'download'
  | 'viewInvoices';

type dtButtonCommand = 'add' | 'edit' | 'complete';
//posible report types TODO: More verbose report descriptions

@Injectable({
  providedIn: 'root',
})
export class FilterFormService {
  /////erlo
  //form will be public so that it can be accessed by the form component
  public form: FormGroup;
  //subject for when the form is finished being populated based on the user logging in
  private formDataLoaded = new BehaviorSubject<boolean>(false);
  //this subject will be used as an observable.  It will fire true to all listening components when the form is finished being populated
  formDataLoaded$ = this.formDataLoaded.asObservable();
  //alert when vehicle regs are set (this is the last step in the form population)
  private vehicleRegsLoaded = new BehaviorSubject<boolean>(false);
  vehicleRegsLoaded$ = this.vehicleRegsLoaded.asObservable();
  //subject to pass user perissions to other components
  private userPerms = new BehaviorSubject<any>({});
  //observable of user permissions
  userPerms$ = this.userPerms.asObservable();

  // subject to pass user profile email
  private userEmail = new BehaviorSubject<any>({});
  userEmail$ = this.userEmail.asObservable();

  //observable for when report is downloaded
  private reportToDownload = new Subject<string>();
  reportToDownload$ = this.reportToDownload.asObservable();

  // if a component needs multiple or single branch selection, set this to true or false
  allowMultipleBranchSelect: boolean = false;

  ///TODO: This need to move to the download service : Samuel 23-02-24
  //Google Analytics for report downloads
  trackFileDownload(fileName: string, userName: any) {
    gtag('event', 'download', {
      event_category: 'File Download',
      file_downloaded: fileName,
      value: 1,
      user_name: userName, // Custom parameter to track user name
    });
  }

  //pass this to components when submitting form.  We use this because we change the form values to the actual values of the selected options when the user selects 'all' options
  formSubmitValue: any;
  //firstTimeFormIs initialised
  firstTimeInit: boolean = true;

  /////

  //show style for different pages
  public formPage:
    | 'general'
    | 'orders'
    | 'extension'
    | 'pav'
    | 'events'
    | 'reports'
    | 'downtime' = 'general';

  showAssetsCols = new Subject<boolean>();
  showMaintenanceMaps: boolean = false;
  showVehicleMake: boolean = false;
  showSuppliers: boolean = false;
  shshowAsstsCols: boolean = true;
  showAsstsCols: boolean = true;
  maintenanceMaps: any;
  showSuppBar: boolean = false;
  showDateSelector: boolean = true;
  selectedVehTypes!: string;
  showVehiclesTypes: boolean = true;
  isLoading: boolean = false;
  julianToDay: any;
  julianFromDay: any;
  vehTypes: { veh_type_map: string; unit_count: number }[] = [
    { veh_type_map: '', unit_count: 0 },
  ];
  supplier!: any;

  //options the user is allowed to select based on user permissions
  allowedBranches!: any;
  allowedDivs!: any;
  allowedVehTypes: any;
  allowedVehMakes: any;
  allowedModelTypes: any;
  allowedVehicles: any;
  allowedSuppliers: any;
  allowedVehicleMakes: any;
  allowedRepairMaps: any;

  allowedMakeTypes: any;
  allAllowedVehicles: any; //All vehicles current user has permission for (unfiltered)

  considerAllDivisions: boolean = false;
  considerAllBranches: boolean = false;
  considerAllVehTypes: boolean = false;
  considerAllModels: boolean = false;
  considerAllSuppliers: boolean = false;
  considerAllRepairMaps: boolean = false;
  considerAllRegistrations: boolean = false;
  //divisions currently selected
  selectedDivisions!: any;
  selectedBranches!: any;
  selectedSuppliers!: any;
  selectedMaps!: any;
  selectedRegistrations!: any;
  selectedReportType!: any;
  //month range picker
  selectedFromMonth!: any;
  selectedToMonth!: any;
  dateRange!: any;
  //enable/disable submit button
  canSubmit: boolean = false;

  // show vehicle type dropdown
  showVehicleTypeDropDown = new Subject<boolean>();
  componentSelected = new Subject<any>();
  showMappingDD = new Subject<boolean>();
  showMake = new Subject<boolean>();
  showSupplierDD = new Subject<boolean>();
  showDateSelectorDD = new Subject<boolean>();
  formLayoutType = new BehaviorSubject<'full-page' | 'compact'>('compact');
  showDateRangeSelector = new Subject<boolean>();
  showComponentDD: boolean = true;
  landingPgFormUpdated = new Subject<any>();
  updateTypeValue = new Subject<any>();
  updateFormInService = new Subject<any>();
  getFormComponentValues = new Subject<any>();
  // showScatterPlotGraph = new Subject<boolean>();

  //show and hide form fields
  showDivisionSelect: boolean = true;
  showBranchSelect: boolean = true;
  showVehTypeSelect: boolean = true;
  showVehicleSelect: boolean = true;
  showSupplierSelect: boolean = true;
  showComponentSelect: boolean = true;

  //submit the form remotely
  submitSmallForm = new Subject<boolean>();

  isMonthRangePickerExpanded: boolean = false;

  public userPermissions!: {
    division: string;
    branches: {
      branch: string;
      c: boolean;
      r: boolean;
      u: boolean;
      d: boolean;
      veh_types: string[];
      branch_vehicles: {
        fleet_no: string;
        vehiclereg: string;
        veh_type_map: string;
        veh_model_map: string;
      }[];
      unique_vehicle_models: string[];
      repairs: {
        veh_type_map: string;
        maps: string[];
        service_providers: string[];
      }[];
    }[];
  }[];

  showDateRange: boolean = true;
  profile: User | null | undefined;

  //Filters for all regs (PAV)
  filteredPavRegs: any[] = [];

  constructor(
    private apiDate: DateManagementService,
    private apiPerms: UserPermissionsService,
    public auth: AuthService,
    private route: ActivatedRoute,
    public globalService: GlobalService,
    private dateRangeService: MonthpickerService
  ) {
    //initiate form with blank values
    this.form = new FormGroup({
      month: new FormControl(null),
      julFromDate: new FormControl(null), //used for storing julian dates from selected month
      julToDate: new FormControl(null),
      julStartMonth: new FormControl(null), //used for month ranges
      julEndMonth: new FormControl(null), //used for month ranges
      division: new FormControl([null]),
      vehicleType: new FormControl([null]),
      models: new FormControl([null]),
      registrations: new FormControl([null]),
      components: new FormControl([null]),
      suppliers: new FormControl([null]),
      branch: new FormControl([null]),
      branch_single: new FormControl([null]), //some form require a single select on the branch dd
      julMonth: new FormControl(null),
      reportType: new FormControl(null),
      all_components_selected: new FormControl(this.considerAllRepairMaps), //used to notify the repairs component that all components are selected and not to draw the scatter plot if it is selected
      periodFilter: new FormControl('Financial Year to Date'), //For PAV form, needs default value
      pavRegs: new FormControl([null]),
      vehicleMake: new FormControl([null]),
    });
    //subscriptions to show/hide certain form fields

    this.subscribeToValueChanges();
    // subscribe to div changes to determine selectable branches
    this.setBranchesOnDivisionChange();
    //sub to branch changes to determine selectable vehicle types
    this.setVehTypesOnBranchChange();
    // sub to veh type changes to change selectable models
    this.setVehModelsOnVehTypeChange();
    //set selectable vehicleregs when the model map is changed
    this.setVehRegsOnModelChange();
    //when vehicle selectiopn changes, get all maps and suppliers for the selected vehicles
    this.setMapsAndSuppliersOnVehicleregChange();
    //subscribe to form slction changes to disable/reset inputs based on selected form
    this.onReportTypeChange();
    this.onSupplierChange();
    this.onComponentChange();
    //subscribe to single branch select changes (used in order form) to enable/disable submit button
    this.setCanSubmitOnBranchChange();
    //set reports form reportType to first option of report types
    this.form.controls['reportType'].setValue('Fleetlist');

    // Check if PAV is loaded, if yes, prevent submission if pavRegs is null
    this.pavSubmitLogic();
  }

  //get all default values for the form.  All these queries need to complete before the form is considered active

  initialiseForm() {
    // Check local storage for user permissions
    const cachedPermissions = localStorage.getItem('userPermissions');

    if (cachedPermissions) {
      // If permissions are available, proceed with them
      this.userPermissions = JSON.parse(cachedPermissions);
      return of(this.userPermissions).pipe(
        tap(() => {
          // Handle the permissions logic with the cached data
          this.processPermissions();
        })
      );
    }

    // If not cached, fetch from API and store in local storage
    return this.auth.user$.pipe(
      switchMap((profile) => {
        this.profile = profile;
        this.userEmail.next(this.profile);

        // Fetch permissions from API
        return this.getUserPermissions().pipe(
          tap((permissions) => {
            this.userPermissions = permissions[0].permissions;
            localStorage.setItem(
              'userPermissions',
              JSON.stringify(this.userPermissions)
            );
            this.userPerms.next(permissions);
            this.processPermissions();
          })
        );
      }),
      catchError((error) => {
        return of(null);
      })
    );
  }

  private processPermissions() {
    this.setAllowedDivDDOptions();
    this.setJulianDatesOnMonthChange();
    this.vehicleRegsLoaded$.subscribe((loaded) => {
      if (loaded && this.firstTimeInit) {
        this.dateRangeService.dateRangeProcessed$.subscribe((processed) => {
          if (processed && this.firstTimeInit) {
            if (!environment.production) {
              this.globalService.showUserPermissions();
            }
            this.firstTimeInit = false;
            this.canSubmit = false;
            this.onSubmit();
          }
        });
      }
    });

    forkJoin({
      julianDates: this.setJulianDates(new Date()),
    }).subscribe();
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SET AND FILTER DROPDOWN OPTIONS (ON VALUE CHANGES) ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

  setAllowedDivDDOptions() {
    console.log(this.allowedDivs);
    this.canSubmit = false;
    //set allowed divisions
    //map divisions assigned to this user for div dd options
    this.allowedDivs = this.userPermissions.map((div) => {
      return { division: div.division };
    });
    //
    //Get all vehicles for allowed branches, independent of filters (for PAV)
    //
    this.allAllowedVehicles = this.userPermissions.flatMap((div) =>
      div.branches.flatMap((branch) => branch.branch_vehicles)
    );

    //if there is more than one division for this user, set the default value to all divisions
    if (this.allowedDivs.length > 1) {
      // this.multipleUserDivisions = true;
      this.form.controls['division'].setValue(['full_fleet']);
      this.form.controls['division'].enable();
    }
    //if only one division, select that one and disable div dd
    else {
      this.form.controls['division'].setValue([this.allowedDivs[0].division]);
      this.form.controls['division'].disable();
    }
    // branch dd will be set from here based on the value changes in div dd
  }

  setBranchesOnDivisionChange() {
    //if the division dd is changed, determine relevant branches for branch dd
    //if the division is changed to full_fleet, all user branches should be selectable
    //if the division is changed to a specific division(s), only the branches in that division should be selectable

    this.form.controls['division'].valueChanges.subscribe(
      (clickedDivisions: string[]) => {
        let allowedBranches: any = [];
        this.considerAllDivisions =
          this.form.controls['division'].value.includes('full_fleet');
        this.userPermissions.forEach((div: any) => {
          if (
            this.considerAllDivisions ||
            clickedDivisions.includes(div.division)
          ) {
            allowedBranches.push(
              div.branches.flatMap((branch: any) => {
                return { branch: branch };
              })
            );
          }
        });
        this.allowedBranches = Array.from(new Set(allowedBranches.flat()));
        this.canSubmit = false;
        this.form.controls['branch_single'].setValue(
          this.allowedBranches[0].branch
        );
        //if there is only one branch selectable, set that branch as selected and disable the branch dd, else, select all branches
        //or of the page is the orders page where only one branch is selectable
        if (this.allowedBranches?.length < 2) {
          ////////////////////////////////////
          this.form.controls['branch'].setValue([
            this.allowedBranches[0].branch,
          ]);
          ////////////////////////////////////
          this.form.controls['branch'].disable();
        } else {
          if (this.formPage != 'orders' && this.formPage != 'events') {
            this.form.controls['branch'].setValue(['all_branches']);
          } else {
            this.form.controls['branch'].setValue([
              this.allowedBranches[0].branch,
            ]);
          }
          this.form.controls['branch'].enable();
        }
      }
    );
  }

  setVehTypesOnBranchChange() {
    //subscribe to branch changes to determine selectable vehicle types
    this.form.controls['branch'].valueChanges
      // .pipe(
      //   debounceTime(300) // Add debounce of half a second
      //   // distinctUntilChanged() // Emit values only if they are different from the last one
      // )
      .subscribe((selectedBranches) => {
        this.canSubmit = false;
        let branches: any = [];
        ///////////////////////////// GOTTA FIND A BETTER WAY OF DEALING WITH WHEN A DD IS MULTI SELECT OR NOT DEPENDING ON THE PAGE IT IS LOADED INTO
        // sometimes branch dd is a multi select, then we use 'includes', else we use '==='
        // console.log(
        //   'branch changed.  ALlow multiples: ',
        //   this.allowMultipleBranchSelect
        // );
        if (!this.allowMultipleBranchSelect) {
          this.considerAllBranches = selectedBranches.includes('all_branches');
          this.allowedBranches.forEach((branch: any) => {
            if (
              this.considerAllBranches ||
              selectedBranches.includes(branch.branch)
            ) {
              branches.push(branch);
            }
          });
        } else {
          this.considerAllBranches = false;
          this.allowedBranches.forEach((branch: any) => {
            if (selectedBranches[0].branch == branch.branch.branch) {
              branches.push(branch);
            }
          });
        }
        // console.log('selected branches: ', branches);
        this.selectedBranches = branches;
        //set single_select branch value

        let allowedVehTypes: any = [];
        this.selectedBranches.forEach((branch: any) =>
          branch.branch.veh_types?.map((vehType: any) => {
            allowedVehTypes.push(vehType);
          })
        );
        //set single branch selector to first of selected branches in multi branch select
        // this.form.controls['branch_single'].setValue(
        //   this.selectedBranches[0].branch
        // );
        //set single branch selector to first of selected branches in multi branch select
        // this.form.controls['branch_single'].setValue(
        //   this.selectedBranches[0].branch
        // );
        this.allowedVehTypes = Array.from(new Set(allowedVehTypes));
        console.log('allowed veh types set:', this.allowedVehTypes);
        //if only one vehicle type selectable, set that vehicle type as selected and disable the vehicle type dd, else, select all vehicle types
        if (this.allowedVehTypes.length == 1) {
          this.form.controls['vehicleType'].setValue([
            this.allowedVehTypes[0].veh_type_map,
          ]);
          this.form.controls['vehicleType'].disable();
        } else {
          this.form.controls['vehicleType'].setValue(['all_veh_types']);
          this.form.controls['vehicleType'].enable();
        }
      });
  }

  setVehModelsOnVehTypeChange() {
    this.form.controls['vehicleType'].valueChanges
      .pipe
      // debounceTime(100), // Add debounce of half a second
      // distinctUntilChanged() // Emit values only if they are different from the last one
      ()
      .subscribe((selectedVehTypes) => {
        this.canSubmit = false;
        // If 'all_veh_types' is selected, consider all vehicle types

        this.considerAllVehTypes = selectedVehTypes.includes('all_veh_types');
        //get selected vehicle types for supplier and mapping filters later
        if (!this.considerAllVehTypes) {
          this.selectedVehTypes = selectedVehTypes;
        } else {
          this.selectedVehTypes = this.allowedVehTypes.map(
            (vehType: any) => vehType.veh_type_map
          );
        }
        // Filter vehicles by the selected vehicle types and extract their model maps
        let vehicleModelMaps: any = [];
        this.selectedBranches.forEach((selectedBranch: any) => {
          selectedBranch.branch.branch_vehicles?.forEach((vehicle: any) => {
            if (
              this.considerAllVehTypes ||
              selectedVehTypes.includes(vehicle.veh_type_map)
            ) {
              vehicleModelMaps.push(vehicle.veh_model_map);
            }
          });
        });

        // Remove duplicates
        this.allowedModelTypes = Array.from(new Set(vehicleModelMaps)).map(
          (model) => {
            return {
              veh_model_map: model,
            };
          }
        );

        // Update form control for models
        if (this.allowedModelTypes.length === 1) {
          this.form.controls['models'].setValue([
            this.allowedModelTypes[0].veh_model_map,
          ]);
          this.form.controls['models'].disable();
        } else {
          this.form.controls['models'].setValue(['all_models']);
          this.form.controls['models'].enable();
        }
      });
  }

  /// set vehicle makes on vehicle types changes
  setVehMakesOnVehTypeChange() {
    this.form.controls['vehicleType'].valueChanges
      .pipe
      // debounceTime(100), // Add debounce of half a second
      // distinctUntilChanged() // Emit values only if they are different from the last one
      ()
      .subscribe((selectedVehTypes) => {
        this.canSubmit = false;
        // If 'all_veh_types' is selected, consider all vehicle types

        this.considerAllVehTypes = selectedVehTypes.includes('all_veh_types');
        //get selected vehicle types for supplier and mapping filters later
        if (!this.considerAllVehTypes) {
          this.selectedVehTypes = selectedVehTypes;
        } else {
          this.selectedVehTypes = this.allowedVehTypes.map((vehType: any) => {
            vehType.veh_make_map;
          });
        }
        // Filter vehicles by the selected vehicle types and extract their model maps
        let vehicleMakeMaps: any = [];
        this.selectedBranches.forEach((selectedBranch: any) => {
          selectedBranch.branch.branch_vehicles?.forEach((vehicle: any) => {
            if (
              this.considerAllVehTypes ||
              selectedVehTypes.includes(vehicle.veh_make_map)
            ) {
              vehicleMakeMaps.push(vehicle.veh_make_map);
            }
          });
        });

        // Remove duplicates
        this.allowedMakeTypes = Array.from(new Set(vehicleMakeMaps)).map(
          (makes) => ({ veh_make_map: makes })
        );
        // Update form control for models
        if (this.allowedMakeTypes.length === 1) {
          this.form.controls['vehicleMake'].setValue([
            this.allowedMakeTypes[0].veh_model_map,
          ]);
          this.form.controls['vehicleMake'].disable();
        } else {
          this.form.controls['vehicleMake'].setValue(['all_makes']);
          this.form.controls['vehicleMake'].enable();
        }
      });
  }

  //set allowed vehicle regs when model is selected
  setVehRegsOnModelChange() {
    this.form.controls['models'].valueChanges
      .pipe(
        debounceTime(100) // Add debounce of half a second
        // distinctUntilChanged() // Emit values only if they are different from the last one
      )
      .subscribe((selectedModels) => {
        this.canSubmit = false;
        this.considerAllModels = selectedModels.includes('all_models');
        // Filter branches to those that are selected

        let vehicleRegistrations: any = [];
        this.selectedBranches.forEach((selectedBranch: any) => {
          selectedBranch.branch.branch_vehicles?.forEach((vehicle: any) => {
            if (
              (this.considerAllModels ||
                selectedModels.includes(vehicle.veh_model_map)) &&
              (this.considerAllVehTypes ||
                this.selectedVehTypes.includes(vehicle.veh_type_map))
            ) {
              vehicleRegistrations.push(vehicle);
            }
          });
        });
        // Remove duplicates
        this.allowedVehicles = Array.from(new Set(vehicleRegistrations));
        console.log('set allowed vehicleregs', this.allowedVehicles.length);
        // Update form control for models
        if (this.allowedVehicles.length === 1) {
          this.form.controls['registrations'].setValue([
            this.allowedVehicles[0],
          ]);
          this.form.controls['registrations'].disable();
        } else {
          this.form.controls['registrations'].setValue(['all_registrations']);
          this.form.controls['registrations'].enable();
        }
        // this.initPav()
      });
  }

  setMapsAndSuppliersOnVehicleregChange() {
    this.form.controls['registrations'].valueChanges.subscribe(
      (selectedRegistrations) => {
        this.canSubmit = false;
        this.considerAllRegistrations =
          selectedRegistrations.includes('all_registrations');
        let allowedSuppliers: any = [];
        let allowedMaps: any = [];
        this.selectedBranches?.forEach((selectedBranch: any) => {
          selectedBranch.branch.repairs?.forEach((repair: any) => {
            if (
              this.considerAllVehTypes ||
              this.selectedVehTypes.includes(repair.veh_type_map)
            ) {
              allowedSuppliers.push(repair.service_providers);
              allowedMaps.push(repair.maps);
            }
          });
        });
        this.allowedRepairMaps = this.globalService.sortArray(
          Array.from(new Set(allowedMaps.flat()))
        );
        this.allowedSuppliers = this.globalService.sortArray(
          Array.from(new Set(allowedSuppliers.flat()))
        );

        if (this.allowedSuppliers.length === 1) {
          this.form.controls['suppliers'].setValue([this.allowedSuppliers[0]]);
          // this.form.controls['suppliers'].disable();
        } else {
          this.form.controls['suppliers'].setValue(['all_suppliers']);
          // this.form.controls['suppliers'].enable();
        }
        if (this.allowedRepairMaps.length === 1) {
          this.form.controls['components'].setValue([
            this.allowedRepairMaps[0],
          ]);
          this.form.controls['components'].disable();
        } else {
          this.form.controls['components'].setValue(['all_repair_maps']);
          this.form.controls['components'].enable();
        }
        // ERLO REMOVED TO TEST REPORTS FORM
        // this.initPav();
        this.vehicleRegsLoaded.next(true);
      }
    );
    //all maps and suppliers for the selected vehicles
  }

  onSupplierChange() {
    this.form.controls['suppliers'].valueChanges.subscribe((supp) => {
      this.considerAllSuppliers = supp.includes('all_suppliers');
      if (!this.considerAllSuppliers) {
        this.selectedSuppliers = supp;
      } else {
        this.selectedSuppliers = this.allowedSuppliers;
      }
      this.canSubmit = true;
    });
  }

  onComponentChange() {
    this.form.controls['components'].valueChanges.subscribe((maps) => {
      this.considerAllRepairMaps = maps.includes('all_repair_maps');
      if (!this.considerAllRepairMaps) {
        this.selectedMaps = maps;
      } else {
        this.selectedMaps = this.allowedRepairMaps;
      }
      this.form.controls['all_components_selected'].setValue(
        this.considerAllRepairMaps
      );
      this.canSubmit = true;
    });
  }

  //set the default (current) julian dates on form init
  setJulianDates(date: Date) {
    const today = date;
    // Get the year, month, and day components
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
    const day = today.getDate().toString().padStart(2, '0');

    // Format the date as 'YYYY-MM-DD' string
    const formattedDate = `${year}-${month}-${day}`;
    return this.apiDate.getJulianMonthV0GetJulianMonthGet(formattedDate).pipe(
      tap((res) => {
        res = res[0];
        //set the julian month
        this.form.controls['month'].setValue(res.selected_month);
        this.form.controls['julMonth'].setValue(res.selected_month);
        //set the julian from date
        this.julianFromDay = res.jul_from_date;
        this.form.controls['julFromDate'].setValue(res.jul_from_date);
        //set the julian to date
        this.julianToDay = res.jul_to_date;
        this.form.controls['julToDate'].setValue(res.jul_to_date);
        this.canSubmit = true;
      })
    );
  }

  //set julian dates when month picker is changed
  setJulianDatesOnMonthChange() {
    this.form.controls['month'].valueChanges.subscribe((month) => {
      //if month is of type 'Date', that means the form was changed by user, then we need to get the updated Julian details
      if (month instanceof Date) {
        this.setJulianDates(month).subscribe();
      }
    });
  }

  //retrieve user perms from api
  getUserPermissions() {
    return this.apiPerms.getPermissionsV0GetPermissionsGet();
  }

  // // retrive user email
  // getUserEmail(){

  // }

  //all form value change subscriptions
  subscribeToValueChanges() {
    this.updateTypeValue.subscribe((vehType) => {
      this.form.controls['vehicleType'].setValue(vehType);
    });
    // this.canSubmit.subscribe((canSubmit) => {
    //   this.canSubmit = canSubmit;
    // });

    this.showAssetsCols.subscribe((showAsstsCols) => {
      this.showAsstsCols = showAsstsCols;
    });
    this.showMappingDD.subscribe((showMaintenance) => {
      this.showMaintenanceMaps = showMaintenance;
    });

    this.showMake.subscribe((show: boolean) => {
      this.showVehicleMake = show;
    });
    this.showSupplierDD.subscribe((showSuppliers) => {
      this.showSupplierSelect = showSuppliers;
    });
    this.showDateSelectorDD.subscribe((showDateSelector) => {
      this.showDateSelector = showDateSelector;
    });
    this.showVehicleTypeDropDown.subscribe((show: boolean) => {
      this.showVehiclesTypes = show;
    });
    this.showDateRangeSelector.subscribe((show: boolean) => {
      this.showDateRange = show;
    });
  }

  // ### TESTING SETTING THE SINGLE BRANCH ON SINGLE BRANCH PAGES SO THAT IT TRIGGERS THE REGISTRATIONS SET (SOMETIMES THE REGISTRATIONS ARE STILL SET FOR ALL BRANCHES)

  setSingleBranch() {
    // this.form.controls['branch'].setValue([this.allowedBranches[0].branch]);
  }

  // ************************************************************************** //
  // **************************    DATE MANAGEMENT   ************************** //
  // ************************************************************************** //
  // format month selected to first day of the month, close month picker when month is selected
  chosenMonthHandler(event: any, dp: any) {
    dp.close();
    const receivedDate = new Date(event);
    const receivedYear = receivedDate.getFullYear();
    const receivedMonth = receivedDate.getMonth();
    this.form.controls['month'].setValue(
      new Date(receivedYear, receivedMonth, 1)
    );
  }
  //closes date range picker when second month is selected
  closeMonthPicker() {
    this.isMonthRangePickerExpanded = false;
  }

  //get julian start and end days of selected range
  dateSelectorRange(event: any) {
    this.dateRange = event;
    // // Assuming event is a string like "YYYY-MM-01 to YYYY-MM-01"
    // // const dates = event.split(' to ');
    // // if (dates.length === 2) {
    // this.setJulianDatesRange(dates).subscribe();
    // this.selectedFromMonth = dates[0].trim();
    // this.selectedToMonth = dates[1].trim();
    // // Update the form controls with these values
    // this.form.controls['fromDate'].setValue(this.selectedFromMonth);
    // this.form.controls['toDate'].setValue(this.selectedToMonth);
    // }
  }

  //get julian start and end days of selected range (called from monthpicker component,)
  setJulianDatesRange(fromMonth: string, toMonth: string) {
    return this.apiDate
      .getJulianMonthRangeV0GetJulianMonthRangeGet(fromMonth, toMonth)
      .pipe(
        tap((res) => {
          res = res[0];
          //set the julian month
          // this.form.controls['month'].setValue(res.selected_month);
          // this.form.controls['julMonth'].setValue(res.selected_month);
          // //set the julian from date
          // this.julianFromDay = res.jul_from_date;
          // this.form.controls['julFromDate'].setValue(res.jul_from_date);
          // //set the julian to date
          // this.julianToDay = res.jul_to_date;
          // this.form.controls['julToDate'].setValue(res.jul_to_date);
          this.canSubmit = true;
        })
      );
  }

  // ************************************************************************** //
  // ************************ HANDLE 'ALL'  SELECTIONS ************************ //
  // ************************************************************************** //
  //if a user selects 'all_vehicles', 'full_fleet', 'all_branches' etc, return the actual values of all selectable options instead of eg 'full_fleet'
  getAllSelectedDivs() {
    if (this.form.controls['division'].value.includes('full_fleet')) {
      this.formSubmitValue.division = this.allowedDivs.map(
        (div: any) => div.division
      );
    } else {
      this.formSubmitValue.division = this.form.controls['division'].value;
    }
  }

  getAllSelectedBranches() {
    if (this.considerAllBranches) {
      this.formSubmitValue.branch = this.allowedBranches.map(
        (branches: any) => branches.branch.branch
      );
    }
    //if page is orders, then branch is not a multi select, so we just get the selected branch
    else if (this.formPage === 'orders') {
      this.formSubmitValue.branch = this.form.controls['branch'].value;
    } else {
      this.formSubmitValue.branch = this.form.controls['branch'].value.map(
        (branch: any) => branch.branch
      );
    }
  }

  getAllSelectedVehTypes() {
    if (this.considerAllVehTypes) {
      this.formSubmitValue.vehicleType = this.allowedVehTypes.map(
        (vehType: any) => vehType
      );
    } else {
      this.formSubmitValue.vehicleType =
        this.form.controls['vehicleType'].value;
    }
  }

  getAllSelectedVehMakes() {
    if (this.considerAllVehTypes) {
      this.formSubmitValue.veh_make_map = this.allowedVehMakes.map(
        (vehMake: any) => vehMake
      );
    } else {
      this.formSubmitValue.vehicleType =
        this.form.controls['vehicleMake'].value;
    }
  }

  getAllSelectedModels() {
    if (this.considerAllModels) {
      this.formSubmitValue.models = this.allowedModelTypes.map(
        (model: any) => model.veh_model_map
      );
    } else {
      this.formSubmitValue.models = this.form.controls['models'].value;
    }
  }

  getAllSelectedVehicleRegs() {
    if (
      this.form.controls['registrations'].value.includes('all_registrations')
    ) {
      this.formSubmitValue.registrations = this.allowedVehicles.map(
        (vehicle: any) => vehicle
      );
    } else {
      this.formSubmitValue.registrations =
        this.form.controls['registrations'].value;
    }
    // console.log(
    //   'Sending registartions',
    //   this.formSubmitValue.registrations.length,
    //   this.formSubmitValue.registrations
    // );
  }

  getAllSelectedSuppliers() {
    if (this.considerAllSuppliers) {
      this.formSubmitValue.suppliers = this.allowedSuppliers.map(
        (supplier: any) => supplier
      );
    } else {
      this.formSubmitValue.suppliers = this.form.controls['suppliers'].value;
    }
  }

  getAllSelectedComponents() {
    if (this.considerAllRepairMaps) {
      this.formSubmitValue.components = this.allowedRepairMaps.map(
        (map: any) => map
      );
    } else {
      this.formSubmitValue.components = this.form.controls['components'].value;
    }
  }

  // ******************************************************************** //
  // *************************    SUBMIT FORM   ************************* //
  // ******************************************************************** //

  // /when loading the single select branch, set the multi select branch to the selected branch
  setBranchesValueToTheSingleBranchValue() {
    console.log('set single branch value to branches');
    this.canSubmit = false;
    this.formDataLoaded.next(false);
    this.form.controls['branch'].setValue([this.allowedBranches[0].branch]);
  }

  onSubmit() {
    this.formSubmitValue = this.form.getRawValue();
    this.removeAllSelections();
    this.canSubmit = false;
    // Notify that form data load is complete
    this.formDataLoaded.next(true);
  }

  removeAllSelections() {
    //here we remove all 'all' values and replace them with the arrays of the actual all selected value
    this.getAllSelectedDivs();
    this.getAllSelectedBranches();
    this.getAllSelectedVehTypes();
    this.getAllSelectedModels();
    this.getAllSelectedVehicleRegs();
    this.getAllSelectedSuppliers();
    this.getAllSelectedComponents();
  }

  // components call this to get form values (components call this only once formdataloaded$ is true)
  getFormValues() {
    this.formSubmitValue = this.form.getRawValue();
    this.removeAllSelections();
    this.canSubmit = false;
    return this.formSubmitValue;
  }

  // *************************    USER PERMISSIONS TO OTHER COMPONENTS   ************************* //
  //pass user permissions to other components
  passUserPermissions() {
    this.userPerms.next(this.userPermissions);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  // ~~~~~~~~~~~~~~~~~~~~~~~~~    ORDERS FORM    ~~~~~~~~~~~~~~~~~~~~~~~~~ //
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  //orders form buttons
  isOrderEditButtonEnabled: boolean = true;
  isOrderAddButtonEnabled: boolean = false;
  isOrderDeleteButtonEnabled: boolean = false;
  isOrderViewAssetButtonEnabled: boolean = false;
  isOrderDownloadButtonEnabled: boolean = true;
  isOrderViewInvoiceButtonEnabled: boolean = false;
  dtSelectButtonsEnabled: boolean = false;

  // order crud permissions per selected branch (used only on orders page, is set on order page branch_single dropdown changes)
  userCanSeeOrders: boolean = false;
  userCanEditOrders: boolean = false;
  userCanAddOrders: boolean = false;
  userCanDeleteOrders: boolean = false;
  //notify order component of button clicks
  orderButtonClicked = new Subject<OrderButtonCommand>();
  //when one of the buttons in the order row is clicked, let the orders component know which button
  ordersButtonClicked(clickedBtn: OrderButtonCommand) {
    this.orderButtonClicked.next(clickedBtn);
  }
  dtButtonClicked = new Subject<dtButtonCommand>();
  onDtClick(clickedBtn: dtButtonCommand) {
    this.dtButtonClicked.next(clickedBtn);
  }
  //////////////////////////// ORDER PERMISSIONS ////////////////////////////
  //if the single select branch dd changes, set caSubmit to true and set user order permissions
  setCanSubmitOnBranchChange() {
    this.form.controls['branch_single'].valueChanges.subscribe((branch) => {
      this.selectedBranches = branch;
      //set user order permissions
      this.userCanSeeOrders = this.selectedBranches.r;
      this.userCanEditOrders = this.selectedBranches.u;
      this.userCanAddOrders = this.selectedBranches.c;
      this.userCanDeleteOrders = this.selectedBranches.d;
      //when the singhle select is changed, also change the multi select to the selected branch
      this.form.controls['branch'].setValue([branch]);
      this.canSubmit = true;
    });
  }
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  // ~~~~~~~~~~~~~~~~~~~~~~~     REPORTS FORM     ~~~~~~~~~~~~~~~~~~~~~~~~ //
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  //depending on the selected report, we will rest and deactivate certain input fields
  onReportTypeChange() {
    this.form.controls['reportType'].valueChanges.subscribe(
      (selectedReport) => {
        //find the report from reportTypes array
        this.selectedReportType = this.reportTypes.find(
          (report) => report.reportTitle === selectedReport
        );
        this.showAllControls();
        this.canSubmit = true;
        //hide fields depending on report type (only necesary to list report types that need to hide certain fields)
        switch (selectedReport) {
          case 'Fleetlist':
            this.form.controls['registrations'].setValue(['all_registrations']);
            this.form.controls['components'].setValue(['all_repair_maps']);
            this.form.controls['suppliers'].setValue(['all_suppliers']);
            this.showVehicleSelect = false;
            this.showComponentSelect = false;
            this.showSupplierSelect = false;
            break;
          case 'Cost per Odo Band':
            this.showSupplierSelect = false;
            break;

          case 'Supplier/Component Report':
            break;

          case 'Trip Data':
            break;
          case 'Asset Detailed - Cost':
            this.showVehicleSelect = true;
            this.showComponentSelect = true;
            this.showSupplierSelect = true;
            break;
          case 'Component Detailed':
            this.showVehicleSelect = true;
            this.showComponentSelect = true;
            this.showSupplierSelect = false;
            break;
          case 'Shoprite Accrual Report':
            break;
          case 'Rebills Report':
            break;
          case 'Shoprite Service Due Projections':
            break;
          case 'Usage Report (Summary)':
            this.form.controls['suppliers'].disable();
            this.form.controls['components'].disable();
            this.showComponentSelect = false;
            this.showSupplierSelect = false;
            break;
          case 'Usage Report (Detailed)':
            this.form.controls['suppliers'].disable();
            this.form.controls['components'].disable();
            this.showComponentSelect = false;
            this.showSupplierSelect = false;
            break;
          case 'Driving Events':
            this.form.controls['registrations'].setValue(['all_registrations']);
            this.form.controls['components'].setValue(['all_repair_maps']);
            this.form.controls['suppliers'].setValue(['all_suppliers']);
            this.showVehicleSelect = false;
            this.showComponentSelect = false;
            this.showSupplierSelect = false;
            break;
          case 'Contract Usage Summary (12 Month)':
            this.form.controls['suppliers'].disable();
            this.form.controls['components'].disable();
            this.showComponentSelect = false;
            this.showSupplierSelect = false;
            break;
          case 'Downtime':
            this.showComponentSelect = false;
            break;
          case 'Fleet Card':
            this.showComponentSelect = false;
            this.showSupplierSelect = false;
            break;
        }
      }
    );
  }

  ///show all form controls
  showAllControls() {
    this.showDivisionSelect = true;
    this.showBranchSelect = true;
    this.showVehTypeSelect = true;
    this.showVehicleSelect = true;
    this.showSupplierSelect = true;
    this.showComponentSelect = true;
  }

  //when download button is clicked
  onDownloadReport() {
    //get report type form value
    //notify report downloads component of report type to download
    this.reportToDownload.next(this.form.controls['reportType'].value);
    this.trackFileDownload(
      this.form.controls['reportType'].toString(),
      this.profile?.email?.toString()
    );
  }

  reportTypes = [
    //?????????????????????????????????????????? sam
    {
      reportTitle: 'Fleetlist',
      reportDescription: 'List of all selected vehicles.',
      selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    },
    //??????????????????????????????????????????
    {
      //done
      reportTitle: 'Monthly Order Report',
      reportDescription:
        'Detailed report of all invoices and orders for the selected vehicles.',
      selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    },
    // done
    {
      reportTitle: 'Supplier/Component Report',
      reportDescription: 'Summarised spend per selected Supplier and Component',
      selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    },
    // {
    //   reportTitle: 'Cost Per Component',
    //   reportDescription: 'Summarised spend per selected component',
    //   selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    // },
    //??????????????????????????????????????????
    {
      //done
      reportTitle: 'Usage Report (Summary)',
      reportDescription: 'Summarised usage report for the selected vehicles',
      selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    },
    //?????????????????????????????????????????? james
    {
      reportTitle: 'Usage Report (Detailed Daily)',
      reportDescription: 'Summarised usage report for the selected vehicles',
      selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    },
    //??????????????????????????????????????????
    {
      reportTitle: 'Cost per Odo Band',
      reportDescription:
        'Cost per component per odo band for the selected vehicles and components',
      selectableFields: ['Division', 'Branch'],
    },
    // {
    //   reportTitle: 'Asset Detailed - Cost',
    //   reportDescription: 'Detailed report for costs per selected assset',
    //   selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    // },
    // {
    //   reportTitle: 'Rebills Report',
    //   reportDescription: 'Rebills reports',
    //   selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    // },
    {
      // awaiting
      reportTitle: 'Shoprite Service Due Projections',
      reportDescription: 'Due Service Projections Report',
      selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    },
    {
      reportTitle: 'Contract Usage Summary (12 Month)',
      reportDescription: 'Contract Usage Over 12 Month Period',
      selectableFields: ['Division', 'Branch'],
    },
    {
      reportTitle: 'Driving Events',
      reportDescription: 'Driving Events',
      selectableFields: ['Division', 'Branch'],
    },
    {
      reportTitle: 'Downtime',
      reportDescription: 'Vehicle downtime tracked over selected date range',
      selectableFields: ['Division', 'Branch'],
    },
    {
      reportTitle: 'Fleet Card',
      reportDescription: 'All fleet card transactions for the selected filters',
      selectableFields: ['Division', 'Branch', 'Type', 'Model'],
    },
  ];

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
  // ~~~~~~~~~~~~~~~~~~~~~~~     PAV FORM     ~~~~~~~~~~~~~~~~~~~~~~~~ //
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

  clearSingleReg(event: any): void {
    this.form.controls['pavRegs'].patchValue('');
    this.filteredPavRegs = this.allowedVehicles.filter(
      (veh: any) =>
        veh.fleet_no.toLowerCase().includes('') ||
        veh.vehiclereg.toLowerCase().includes('')
    );
  }

  filteredPavRegsDD(event: any): void {
    const input = event.target.value.toLowerCase();
    this.filteredPavRegs = this.allowedVehicles.filter(
      (veh: any) =>
        veh.fleet_no.toLowerCase().includes(input) ||
        veh.vehiclereg.toLowerCase().includes(input)
    );
  }
  selectedPavRegsDD(event: MatAutocompleteSelectedEvent): void {
    this.form.controls['pavRegs'].patchValue(
      event.option.value.fleet_no + ' (' + event.option.value.vehiclereg + ')'
    );
  }

  initPav() {
    //Defaults the pav reg selector to first in array
    const vehicle = this.allowedVehicles[0];
    this.form.controls['pavRegs'].setValue(
      vehicle.fleet_no + ' (' + vehicle.vehiclereg + ')'
    );
  }

  patchPavReg(reg: string) {
    const vehicle = this.allowedVehicles.filter(
      (veh: any) => veh.vehiclereg === reg
    );
    this.form.controls['pavRegs'].patchValue(
      vehicle[0].fleet_no + ' (' + vehicle[0].vehiclereg + ')'
    );
  }

  pavSubmitLogic() {
    this.form.controls['pavRegs'].valueChanges.subscribe((veh) => {
      if (veh != '') {
        this.canSubmit = true;
      }
    });
  }

  // ####CONTROL MULTIPLE VS SINGLE SELECT DD's
  selectMultipleBranches(value: boolean) {
    this.allowMultipleBranchSelect = value;
    //set branch dd value to the first of currently selected branches, or if all_branches is selected, the first of selectable branches
    const currentlySelectedBranches = this.form.controls['branch'].value;
    if (!this.allowMultipleBranchSelect) {
      this.form.controls['branch'].setValue(this.allowedBranches[0].branch);
    } else {
      // this.form.controls['branch'].setValue([this.allowedBranches[0].branch]);
    }
  }

  setMultiOrSingleBranchValues() {
    const currentlySelectedBranches = this.form.controls['branch'].value;
    if (this.allowMultipleBranchSelect) {
      //check if currentlySelectedBranches is an array, if it is, set branch control to this value
      if (Array.isArray(currentlySelectedBranches)) {
        this.form.controls['branch'].setValue(currentlySelectedBranches);
      } else {
        this.form.controls['branch'].setValue([currentlySelectedBranches]);
      }
    }
    //if we only allow a sing select on branches, set the value to the first value if multiple branches are selected
    else {
      if (Array.isArray(currentlySelectedBranches)) {
        this.form.controls['branch'].setValue(currentlySelectedBranches[0]);
      } else {
        this.form.controls['branch'].setValue([currentlySelectedBranches]);
      }
    }
  }
}
