import { Injectable, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserPermissionDisplayComponent } from 'src/app/features/home/user-permissions/user-permission-display/user-permission-display.component';

// Type for orders selected from AG grid
type InvoiceObject = {
  date: string;
  vehiclereg: string;
  fleet_no: string;
  order_no: string;
  invoice_no: string;
  quote_no: number;
  amount: number;
  invoice_amount: number;
  invoice_diff: number;
  service_provider: string;
  description: string;
  contract_type: string;
  odo: number;
  client_ref: string;
  veh_type_map: string;
  repair_type: string;
  mapping: string;
};

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}
  titleUpdate = new Subject<string>();

  passCPKRankings = new Subject<SimpleChange>();
  // show drivers events top row
  showDriversEventsTop = new Subject<boolean>();
  // show fleetcard  top row
  showFleetCardTop = new Subject<boolean>();
  // show Orders page top row
  showOrdersPageTop = new Subject<boolean>();
  // show landing page top row
  showLandingPageTop = new Subject<boolean>();
  //show component page top row
  showComponentPageTop = new Subject<boolean>();
  //show invoice_status page top row
  showInvStatusPageTop = new Subject<boolean>();
  // show cpk usage top row
  showCPKUsageTop = new Subject<boolean>();
  // show supplier top row
  showSupplierTopRow = new Subject<boolean>();
  // show expirations page top row
  showExpirationsPageTop = new Subject<boolean>();
  //show fleetlist vehicle count top row
  showFleetlistVehicleCountTopRow = new Subject<boolean>();

  //show orders balancing top row
  showOrdersBalancesTopRow = new Subject<boolean>();

  //event emitter for the popup form
  saveOrderSubject = new Subject<any>();

  showDashboardTopRow = new Subject<boolean>();

  showPavTopRow = new Subject<boolean>();

  showStatsTop = new Subject<boolean>();

  //show small form
  showSmallForm = new Subject<boolean>();
  public userRoleId: number | undefined = 0;
  public profileEmail$ = new BehaviorSubject('');
  public companyId$ = new BehaviorSubject(0);
  public userRoleIdObservable$ = new BehaviorSubject(this.userRoleId);

  // Error notification : Snackbar raise an error
  public raiseError(err: any) {
    this.snackBar.open(`An Error Occured: ${err.message}`, 'Close', {
      panelClass: ['red-snackbar'],
    });
  }

  public showDownloadMessage() {
    // Popup snackbar for downloading files
    this.snackBar.open('Generating Report, Please Wait...');
  }

  public closeDownloadMessage() {
    this.snackBar.dismiss();
  }
  /**
   *
   * @returns {string} Current Profile's email address
   */
  getProfileEmail() {
    return this.profileEmail$.getValue();
  }

  triggerSaveOrder(orderData: any) {
    this.saveOrderSubject.next(orderData);
  }

  getCompanyId() {
    return this.companyId$.asObservable();
  }

  /**
   * Formats a tabulator field as currency (rand)
   * @returns {object} Tabulator formatter for ZAR
   */
  toTabZAR() {
    return {
      decimal: ',',
      thousand: ' ',
      symbol: 'R ',
      negativeSign: true,
      precision: 2,
    };
  }

  /**
   *
   * @param params - A number
   * @returns {string} A string, formatted as R number
   */
  toRandValues(params: any) {
    // Ensure the value is a number and format it
    if (typeof params.value === 'number') {
      let formattedValue = params.value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `R ${formattedValue}`;
    }
    return params.value; // Return the original value if not a number
  }

  /**
   *
   * @param cell - A tabulator cell
   * @returns {object} A tabulator cell, formatted as a distance in Km
   */
  toTabKM(cell: any) {
    return `${new Intl.NumberFormat('en-ZA').format(
      parseFloat(cell.getValue())
    )} km`;
  }

  /**
   *
   * @param value - A string of numeric characters
   * @returns {string} A string of numeric characters formatted as ZAR
   */
  toZAR(value: string) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    })
      .format(parseFloat(value))
      .replace('ZAR', 'R');
  }

  toCPK(value: any) {
    return (
      new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
      })
        .format(parseFloat(value))
        .replace('R', '') + ' c/Km'
    );
  }

  /**
   *
   * @param value - A string of numeric characters
   * @returns {string} A string of numeric characters formatted as kilometers
   */
  toKM(value: string) {
    // Check if value is not equal to 0 or null
    if (value === '' && value === null) {
      return 0 + ' Km';
    }
    // If value is 0 or null, proceed with formatting
    return new Intl.NumberFormat('en-ZA').format(parseFloat(value)) + ' Km';
  }
  
  initialiseState() {
    // this.auth.user$.subscribe(user => {
    //   this.profileEmail$.next(user?.email || "");
    // });
  }

  /**
   * Disables all top rows. Enable specific top row per component
   */
  disableTopRows() {
    this.showDriversEventsTop.next(false);
    // orders  page toptow
    this.showOrdersPageTop.next(false);
    //dashboard top row
    this.showDashboardTopRow.next(false);

    // hide landing page top stats row
    this.showLandingPageTop.next(false);
    // hide componnent top row
    this.showComponentPageTop.next(false);
    // hide invoice status top row
    this.showInvStatusPageTop.next(false);
    // hide cpk usage top row
    this.showCPKUsageTop.next(false);
    // hide supplier top row
    this.showSupplierTopRow.next(false);
    // hide expirations top row
    this.showExpirationsPageTop.next(false);
    // hide PAV top row
    this.showPavTopRow.next(false);
    // hide stats top row
    this.showStatsTop.next(false);
    //show small form
    this.showSmallForm.next(true);

    //fleetlist top row
    this.showFleetlistVehicleCountTopRow.next(false);
  }

  /**
   *
   * @param date - A date object
   * @returns {string} A date formatted 'YYYY-MM-DD'
   */
  formatDatetoAPI(date: any) {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = (originalDate.getMonth() + 1).toString().padStart(2, '0');
    const day = originalDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  /**
   *
   * @param inputArray - An array of strings
   * @returns {string[]} The array of strings in alphabetical order
   */
  sortArray(inputArray: string[]): string[] {
    //Sorts an array of strings alphabetically
    const sortedArray = inputArray.slice().sort();

    return sortedArray;
  }

  /**
   * Calls the user permissions popup for currently logged in user
   */
  showUserPermissions() {
    // create the logick for this to popup a permission details for the logged user
    const onUserPermissionPopup = this.dialog.open(
      UserPermissionDisplayComponent,
      {
        width: '100%',
        height: '100%',
      }
    );
  }

  /**
   *
   * @param orderObject An array of objects from agGrid.api.getSelectedRows()
   * @returns A list of order numbers
   */
  extractOrderNumbers(orderObject: any[]): string[] {
    const orderNumbers: string[] = [];

    orderObject.forEach((invoice) => {
      orderNumbers.push(invoice.order_no);
    });

    return orderNumbers;
  }

  /**
   *  Format colors for graph bars
   */
  getGraphBarColor() {
    return {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#69d2dc' },
        { offset: 1, color: 'white' },
      ],
      global: false,
    };
  }

  getGraphBarSecColor() {
    return {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#f39200' },
        { offset: 1, color: 'white' },
      ],
      global: false,
    };
  }

  getGraphBarTerColor() {
    return {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#39a750' },
        { offset: 1, color: 'white' },
      ],
      global: false,
    };
  }
  parse_pavreg(input_string: string): any | null {
    // Use regular expression to find text inside parentheses
    const match = input_string.match(/\((.*?)\)/);

    // Check if a match is found
    if (match) {
      return [{ vehiclereg: match[1], fleet_no: '' }];
    } else {
      return null;
    }
  }
}
