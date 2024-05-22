import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserPermissionsService } from 'src/app/core/api/api_service';

export interface Users {
  first_name: string;
  last_name: string;
  emil: string;
  permissions: string;
}

interface TransformedBranch {
  c: string;
  d: string;
  r: string;
  u: string;
  branch: string;
  veh_types: string[];
}

interface TransformedBranches {
  [division: string]: TransformedBranch[];
}

@Component({
  selector: 'app-user-permissions',
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss'],
})
export class UserPermissionsComponent implements OnInit {

  dataSource: Users[] = [];
  userForm: FormGroup = new FormGroup([]);
  permissionFormGroup!: FormGroup;
  permissions: FormArray = new FormArray<FormGroup>([
  ]);
  permissionGroup!: FormGroup;
  /// user
  selectedUser: boolean = false;

  branchList: string[] = [];
  vehicleTypeList: string[] = [];
  selectedDivision: string[] = [];
  vehicleTypeObjects: any[] = [];

  showBranchPermissions: boolean = false;

  VehTypeJsonObject: any;
  allDivBranchVehTypesDetails: any;
  branches: any;
  selectedBranch: any;
  selectedVehicles: any;

  isDivDisabled: boolean = true;
  isUserSelected: boolean = false;

  // toggle
  isYesOption: boolean = false;
  formValues: any;
  divisionList: any;


  constructor(
    private api: UserPermissionsService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      first_name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      permissions: this.permissions,
    });
  }

  ngOnInit() {
    this.callAPI();
  }

  addPermissionGroup(division: string, branch: string, veh_types: string[]) {
    this.permissionGroup = new FormGroup({
      branches: new FormGroup({
        c: new FormControl(false),
        r: new FormControl(false),
        u: new FormControl(false),
        d: new FormControl(false),
        branch: new FormControl({
          value: branch || 'all_branches',
          disabled: true,
        }),
        veh_types: new FormControl({
          value: veh_types || ['all_vehicles'],
          disabled: true,
        }),
      }),
      division: new FormControl(division || 'full_fleet'),
    });
    this.permissions.push(this.permissionGroup);
  }

  addBranchPermissions(branch: string, veh_types: string[]) {
    this.showBranchPermissions = true;
    const selectedDivision = this.permissionControls[0]?.get('division')?.value;

    const permissionGroup = new FormGroup({
      branches: new FormGroup({
        c: new FormControl(false),
        r: new FormControl(false),
        u: new FormControl(false),
        d: new FormControl(false),
        branch: new FormControl({
          value: branch || 'all_branches',
          disabled: false,
        }),
        veh_types: new FormControl({
          value: veh_types || ['all_vehicles'],
          disabled: true,
        }),
      }),
      division: new FormControl(selectedDivision),
    });

    this.permissions.push(permissionGroup);

    // Find the index of the newly added permissionGroup
    let indexOfNewGroup: number | null = null;
    for (let i = 0; i < this.permissions.length; i++) {
      if (this.permissions.at(i) === permissionGroup) {
        indexOfNewGroup = i;
        break;
      }
    }

    if (indexOfNewGroup !== null) {
      const branchesArray = [this.branches];
      const branchesControl = (
        this.permissions.at(indexOfNewGroup) as FormGroup
      ).get('branches.branch') as FormArray;
      branchesControl.push(new FormControl(branchesArray));
    }
  }

  get permissionControls(): FormGroup[] {
    return this.permissions.controls as FormGroup[];
  }

  editUser() { }

  //

  getAllEmployee() {
    this.selectedUser = true;
    this.isUserSelected = false;
    this.api.getUserForPermissionPageV0UsersGet().subscribe((users: any) => {
      this.dataSource = users;
    });
  }

  callAPI() {
    this.api.getUserDivisionV0UsersDivisionsGet().subscribe((data: any) => {
      this.allDivBranchVehTypesDetails = data;
      this.divisionList = data.map((item: any) => item.division);
    });
  }


  selectDivision(division: any) {
    this.branchList = this.allDivBranchVehTypesDetails
      .filter((branch: any) => branch.division === division)
      .flatMap((branch: any) => branch.branch);

    // Enable the "Branch" control in each permission group
    this.permissionControls.forEach((permissionGroup: FormGroup) => {
      const branchControl = permissionGroup.get('branches.branch');
      if (branchControl) {
        branchControl.enable();
      }
    });
  }

  /// returns all the vehicle types based on the selected branch
  selectBranch(branchList: string[]) {
    // Filter data based on selected branches
    const selectedData = this.allDivBranchVehTypesDetails.filter((entry: any) =>
      entry.branch.some((branch: any) => branchList.includes(branch))
    );

    // Use a Set to store unique vehicle types
    const uniqueVehicleTypes = new Set<string>();

    // Collect unique vehicle types from the filtered data
    selectedData.forEach((entry: any) => {
      entry.vehicle_types.forEach((vehicleType: string) => {
        uniqueVehicleTypes.add(vehicleType);
      });
    });

    // Convert the Set back to an array
    this.vehicleTypeList = ['all_vehicles', ...Array.from(uniqueVehicleTypes)];

    // Enable the "veh_types" control in each permission group
    this.permissionControls.forEach((permissionGroup: FormGroup) => {
      const vehTypesControl = permissionGroup.get('branches.veh_types');
      if (vehTypesControl) {
        vehTypesControl.enable();
      }
    });
  }

  selectVehicleType(vehicleTypeList: string[]) {
    //store vehicle types in an object and return them in a form
    vehicleTypeList = this.VehTypeJsonObject;
  }

  createUser() {
    // Set this to true to display the form
    this.isUserSelected = true;
    this.isDivDisabled = false;
    this.selectedUser = false;
  }

  onFormReset() {
    this.userForm.reset({
      email: '',
      first_name: '',
      last_name: '',
      permissions: [],
    });
  }

  onSlideToggleChange(event: MatSlideToggleChange) {
    this.isYesOption = event.checked;
    this.permissions.clear();
  }

  onSubmit(): any {
    // Capture form values before submitting
    this.formValues = this.userForm.value;

    if (this.isYesOption) {
      const result: any[] = [];
      this.allDivBranchVehTypesDetails.forEach((entry: any) => {
        const branches = entry.branch.map((branch: any) => {
          return {
            c: 'true',
            d: 'true',
            r: 'true',
            u: 'true',
            branch: branch,
            veh_types: entry.vehicle_types,
          };
        });

        result.push({
          branches,
          division: entry.division,
        });
      });

      this.formValues = {
        ...this.formValues,
        permissions: result,
      };


      this.api
        .addNewUserUserTableV0AddNewUserUserTablePost(this.formValues)
        .subscribe({
          next: (res: any) => {
            // Reload the page after successful user creation
            this.snackBar.open('User Created Successfully!', 'Close', {
              duration: 2000,
            });
            this.permissions.clear();
            this.onFormReset();
          },
          error: (error: any) => {
            console.error('API error:', error);

            if (error.status === 0) {
              this.snackBar.open(
                'User already exists. Please choose a different email.',
                'Close',
                {
                  duration: 2000,
                }
              );
              this.permissions.clear();
              this.onFormReset();
            } else {
            }


          },
          complete: () => {
            this.permissions.clear();
            this.onFormReset();
          },
        });

      return result;


    } else {
      const transformedBranches: TransformedBranches = {};
      this.formValues.permissions.forEach((permission: any) => {
        const division = permission.division;
        if (!transformedBranches.hasOwnProperty(division)) {
          transformedBranches[division] = [];
        }
        const branches = {
          c: permission.branches.c.toString(),
          r: permission.branches.r.toString(),
          u: permission.branches.u.toString(),
          d: permission.branches.d.toString(),
          branch: permission.branches.branch,
          veh_types: permission.branches.veh_types
        };
        transformedBranches[division].push(branches);
      });

      const permissions = Object.entries(transformedBranches).map(([division, branches]) => ({
        division,
        branches
      }));

      // Update this.formValues with the transformed data
      this.formValues = {
        ...this.formValues,
        permissions: permissions,
      };
      // Log the transformed data

      this.api
        .addNewUserUserTableV0AddNewUserUserTablePost(this.formValues)
        .subscribe({
          next: (res: any) => {
            // Reload the page after successful user creation
            this.snackBar.open('User Created Successfully!', 'Close', {
              duration: 2000,
            });
            this.permissions.clear();
            this.onFormReset();
          },
          error: (error) => {
            console.error('API error:', error);

            if (error.status === 0) {
              this.snackBar.open(
                'User already exists. Please choose a different email.',
                'Close',
                {
                  duration: 2000,
                }
              );
              this.permissions.clear();
              this.onFormReset();
            }

          },
          complete: () => {
            this.permissions.clear();
            this.onFormReset();
          },
        });
    }
  }
}
