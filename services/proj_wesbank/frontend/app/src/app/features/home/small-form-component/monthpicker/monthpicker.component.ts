import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { SmallFormService } from '../small-form.service';
import { MonthpickerService } from './monthpicker.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-monthpicker',
  templateUrl: './monthpicker.component.html',
  styleUrls: ['./monthpicker.component.scss'],
})
export class MonthpickerComponent {
  currentRoute!: string;
  constructor(
    private smallForm: SmallFormService,
    private monthPickerService: MonthpickerService,
    public route: Router
  ) {}
  //' todo sam: to create a subject once done with this component
  @Output() monthRangeSelected = new EventEmitter<string[]>();

  //determine if second month is selected to cloase picker
  @Output() rangeComplete = new EventEmitter<void>();

  private readonly onDestroy = new Subject<void>();

  currentYearIndex!: number;
  years!: Array<number>;
  // months: Array<string>;
  months: any;
  // monthsData: Array<{
  //   monthName: string;
  //   monthYear: number;
  //   isInRange: boolean;
  //   isLowerEdge: boolean;
  //   isUpperEdge: boolean;
  // }>;
  julianFromDate!: string;
  julianToDate!: string;
  julianFromMonth!: string;
  julianToMonth!: string;

  monthsData!: Array<{
    monthName: string;
    monthNumber: number; // Add this line
    monthYear: number;
    isInRange: boolean;
    isLowerEdge: boolean;
    isUpperEdge: boolean;
  }>;
  rangeIndexes!: any;
  monthViewSlicesIndexes!: Array<number>;
  // monthDataSlice: Array<{
  //   monthName: string;
  //   monthYear: number;
  //   isInRange: boolean;
  //   isLowerEdge: boolean;
  //   isUpperEdge: boolean;
  // }>;
  monthDataSlice!: Array<{
    monthName: string;
    monthNumber: number; // Add this line
    monthYear: number;
    isInRange: boolean;
    isLowerEdge: boolean;
    isUpperEdge: boolean;
  }>;
  globalIndexOffset!: number;
  firstInit: boolean = true;
  onClick(indexClicked: any) {
    // Step 1: Check if the start of the range is not yet set
    if (this.rangeIndexes[0] === null) {
      // Set the start of the range to the clicked month index
      this.rangeIndexes[0] = this.globalIndexOffset + indexClicked;
    }
    // Step 2: Check if the end of the range is not yet set
    else if (this.rangeIndexes[1] === null) {
      // Set the end of the range to the clicked month index
      this.rangeIndexes[1] = this.globalIndexOffset + indexClicked;
      // Ensure the start of the range is less than the end
      this.rangeIndexes.sort((a: any, b: any) => a - b);

      // Update each month's state based on whether it is in the selected range
      this.monthsData.forEach((month, index) => {
        month.isInRange =
          this.rangeIndexes[0] <= index && index <= this.rangeIndexes[1];
        month.isLowerEdge = this.rangeIndexes[0] === index;
        month.isUpperEdge = this.rangeIndexes[1] === index;
      });

      // Format the selected date range for emitting
      const fromMonthYear = this.monthsData[this.rangeIndexes[0]];
      const toMonthYear = this.monthsData[this.rangeIndexes[1]];
      const fromDate = `${fromMonthYear.monthYear}-${fromMonthYear.monthNumber
        .toString()
        .padStart(2, '0')}-01`;
      const toDate = `${toMonthYear.monthYear}-${toMonthYear.monthNumber
        .toString()
        .padStart(2, '0')}-01`;
      // const toDate = this.getLastDayOfMonth(
      //   toMonthYear.monthYear,
      //   toMonthYear.monthNumber
      // );
      //get the julian dates for the selected months
      this.getJulianDates(fromDate, toDate);

      // Emit the selected date range
      // this.dateSelectedData(`${fromDate} to ${toDate}`);

      // Emit the event to signal that the range selection is complete
      this.rangeComplete.emit();
      // this.formService.monthSubject.next(true);
    }
    // Step 3: If both start and end of the range are already set
    else {
      // Reinitialize the range indexes and month data
      this.initRangeIndexes();
      this.initMonthsData();
      // Recursively call onClick to set the new range
      this.onClick(indexClicked);
      // Update the view slice to reflect the new selection
      this.sliceDataIntoView();
    }
  }

  dateSelectedData(string: any) {
    this.monthRangeSelected.emit(string);
  }

  sliceDataIntoView() {
    this.globalIndexOffset = this.monthViewSlicesIndexes[this.currentYearIndex];
    this.monthDataSlice = this.monthsData.slice(
      this.globalIndexOffset,
      this.globalIndexOffset + 24
    );
  }

  incrementYear() {
    if (this.currentYearIndex !== this.years.length - 1) {
      this.currentYearIndex++;
      this.sliceDataIntoView();
    }
  }

  decrementYear() {
    if (this.currentYearIndex !== 0) {
      this.currentYearIndex--;
      this.sliceDataIntoView();
    }
  }

  initRangeIndexes() {
    this.rangeIndexes = [null, null];
  }

  // initMonthsData() {
  //   this.monthsData = new Array();
  //   this.years.forEach((year) => {
  //     this.months.forEach((month) => {
  //       this.monthsData.push({
  //         monthName: month,
  //         monthYear: year,
  //         isInRange: false,
  //         isLowerEdge: false,
  //         isUpperEdge: false,
  //       });
  //     });
  //   });
  // }

  initMonthsData() {
    this.monthsData = new Array();
    this.years.forEach((year) => {
      this.months.forEach((month: any) => {
        this.monthsData.push({
          monthName: month.name,
          monthNumber: month.number,
          monthYear: year,
          isInRange: false,
          isLowerEdge: false,
          isUpperEdge: false,
        });
      });
    });
  }

  initYearLabels() {
    const currentYear = new Date().getFullYear();
    const range = (start: any, stop: any, step: any) =>
      Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
      );
    this.years = range(currentYear - 1, currentYear + 5, 1);
  }

  // initMonthLabels() {
  //   this.months = new Array(12).fill(0).map((_, i) => {
  //     return new Date(`${i + 1}/1`).toLocaleDateString(undefined, {
  //       month: 'short',
  //     });
  //   });
  // }

  initMonthLabels() {
    this.months = new Array(12).fill(0).map((_, i) => {
      return {
        name: new Date(0, i).toLocaleDateString(undefined, {
          month: 'short',
        }),
        number: i + 1,
      };
    });
  }

  initViewSlices() {
    this.monthViewSlicesIndexes = [];
    this.years.forEach((year, index) => {
      if (index === 0) {
        this.monthViewSlicesIndexes.push(0);
      } else if (index === 1) {
        this.monthViewSlicesIndexes.push(6);
      } else
        this.monthViewSlicesIndexes.push(
          this.monthViewSlicesIndexes[index - 1] + 12
        );
    });
  }

  ngOnInit() {
    
    this.initYearLabels();
    this.initMonthLabels();
    this.initViewSlices();
    this.initMonthsData();
    this.initRangeIndexes();
    this.setCurrentMonth();
    this.sliceDataIntoView();
    if (this.monthPickerService.checkFirstInit()) {
      this.updateMonthSelection();
    this.monthPickerService.isFirstInit = false;
    }

    else {
      this.getJulianDates(
        this.monthPickerService.getLastFromSelection(),
        this.monthPickerService.getLastToSelection()
        );
      
    }

    // Current route
    this.route.events.subscribe(() => {
      this.currentRoute = this.route.url;
    });
  }

  // Get current route
  isRoute(route: string): boolean {
    return this.currentRoute === route;
  }

  // Check if route is reports or downtime
  isReportOrDowntimeRoute(): boolean {
    return this.currentRoute === '/reports' || this.currentRoute === '/downtime';
  }

  // use this to set monthpicker to current month
  setCurrentMonth() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Note: January is 0

    this.currentYearIndex = this.years.findIndex(
      (year) => year === currentYear
    );

    // Calculate global index of the current month
    const globalIndex = this.years.indexOf(currentYear) * 12 + currentMonth;

    // Set rangeIndexes to current month
    this.rangeIndexes = [globalIndex, globalIndex];
    
  }

  //use this to set monthpicker to month before current month
  // setCurrentMonth() {
  //   const currentDate = new Date();
  //   currentDate.setMonth(currentDate.getMonth() - 1); // Set to previous month
  //   const previousYear = currentDate.getFullYear();
  //   const previousMonth = currentDate.getMonth(); // Note: January is 0

  //   this.currentYearIndex = this.years.findIndex(
  //     (year) => year === previousYear
  //   );

  //   // Calculate global index of the previous month
  //   const globalIndex = this.years.indexOf(previousYear) * 12 + previousMonth;

  //   // Set rangeIndexes to previous month
  //   this.rangeIndexes = [globalIndex, globalIndex];
  //   this.updateMonthSelection();
  // }

  updateMonthSelection() {
    this.monthsData.forEach((month, index) => {
      month.isInRange = index === this.rangeIndexes[0];
      month.isLowerEdge = index === this.rangeIndexes[0];
      month.isUpperEdge = index === this.rangeIndexes[1];
    });

    const fromMonthYear = this.monthsData[this.rangeIndexes[0]];
    const fromDate = `${fromMonthYear.monthYear}-${fromMonthYear.monthNumber
      .toString()
      .padStart(2, '0')}-01`;

    const toMonthYear = this.monthsData[this.rangeIndexes[1]];
    //use this if you want the last day of the selected month (non Julian stuff, I guess.  Just left it here in case)
    // const toDate = this.getLastDayOfMonth(
    //   toMonthYear.monthYear,
    //   toMonthYear.monthNumber
    // );
    const toDate = `${toMonthYear.monthYear}-${toMonthYear.monthNumber
      .toString()
      .padStart(2, '0')}-01`;
    this.getJulianDates(fromDate, toDate);
    // You can use this value to show the default selection or emit it
    // this.dateSelectedData(`${fromDate} to ${toDate}`);
  }

  getLastDayOfMonth(year: any, month: any) {
    const date = new Date(year, month, 0); // 0th day of next month is the last day of the current month
    return `${year}-${month.toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  //get julian equivelants of selected months
  getJulianDates(fromDate: string, toDate: string) {
    this.smallForm.setJulianDatesRange(fromDate, toDate).subscribe((res) => {
      res = res[0];
      this.julianFromDate = res.jul_start_date;
      this.julianToDate = res.jul_end_date;
      // this.smallForm.form.controls['julFromDate'].setValue(this.julianFromDate);
      // this.smallForm.form.controls['julToDate'].setValue(this.julianToDate);
      this.smallForm.form.controls['julStartMonth'].setValue(
        res.jul_start_month
      );
      this.smallForm.form.controls['julEndMonth'].setValue(res.jul_end_month);
      if (this.firstInit) {
        this.firstInit = false;
        this.monthPickerService.dateRangeProcessed.next(true);
      }
      this.dateSelectedData(`${this.julianFromDate} to ${this.julianToDate}`);
      this.monthPickerService.lastFromSelection = this.julianFromDate;
      this.monthPickerService.lastToSelection = this.julianToDate;
    });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
