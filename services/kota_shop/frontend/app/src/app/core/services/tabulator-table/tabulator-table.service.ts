import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

@Injectable({
  providedIn: 'root',
})
export class TabulatorTableService {
  private vehicleRegSubject = new BehaviorSubject<string>('');
  // subject as an observable
  vehicleReg$ = this.vehicleRegSubject.asObservable();

  constructor() {}

  generateTable(selector: string, columns: any[], data: any[], height: string) {
    // Define a type for the Tabulator layout
    type TabulatorLayout = 'fitColumns';

    // Define the setup for the table with data
    const tableWithData = {
      layout: 'fitColumns' as TabulatorLayout,
      columns: columns,
      selectable: 1,
      height: height,
    };

    // Define the setup for the table without data
    const tableWithoutData =
      // Check if there is no data
      !data || data.length === 0
        ? // Display a placeholder if there is no data
          { placeholder: 'No Data Available For Selected Filters' }
        : {
            data: data,
            height: height,
          };

    // Create a new Tabulator instance for the vehicle expense table
    const table = new Tabulator(selector, {
      ...tableWithData, // Spread the table setup with data
      ...tableWithoutData, // Spread the table setup without data
    });

    return table;
  }

  // exportToCSV() {
  //   if (table) {
  //     const sheets = {};
  //     this.table.download('csv', fileName, { sheets: sheets });
  //   } else {
  //     console.error('Tabulator table is not initialized.');
  //   }
  // }
}
