import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MonthpickerService {
  constructor() {}
  private monthRange = new Subject<string>();

  //alert smallForService when julian dates are done loading
  dateRangeProcessed = new BehaviorSubject<boolean>(false);
  dateRangeProcessed$ = this.dateRangeProcessed.asObservable();
  isFirstInit: boolean = true;
  lastFromSelection: string = '';
  lastToSelection: string = '';

  getMonthRangeDate(data: string) {
    this.monthRange.next(data);
  }

  getLastFromSelection(){
    return this.lastFromSelection
  }

  getLastToSelection(){
    return this.lastToSelection
  }

  checkFirstInit(){
    return this.isFirstInit
  }

  getMonthData() {
    return this.monthRange.asObservable();
  }
}
