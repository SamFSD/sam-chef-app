import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PavSelectorService {
  private periodFilterSubject = new BehaviorSubject<string>('');
  periodFilter$ = this.periodFilterSubject.asObservable();

  private vehicleregSubject = new BehaviorSubject<string>('');
  vehiclereg$ = this.vehicleregSubject.asObservable();

  private componentFilterSubject = new BehaviorSubject<string>('all_components');
  componentFilter$ = this.componentFilterSubject.asObservable();

  constructor() { }

  setPeriodFilter(value: string) {
    this.periodFilterSubject.next(value);
  }
  setVehiclereg(value: string) {
    this.vehicleregSubject.next(value);
  }
  setComponentFilter(value: string) {
    this.componentFilterSubject.next(value);
  }
 
}
