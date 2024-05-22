import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

type EventSelected =
  | 'Acceleration'
  | 'Braking'
  | 'Cornering'
  | 'Idling'
  | 'Speeding'
  | 'Moderate Impact'
  | 'Severe Impact'
  | 'Impact';

@Injectable({
  providedIn: 'root',
})
export class DrivingEventsService {
  // if a event gauge is selected, pass this event to the per-event table and events map
  onEventSelect = new BehaviorSubject<EventSelected>('Speeding');
  
  passDataFromPerEventTableToMap = new BehaviorSubject<any>('Total');
  
  eventLoadedSubject = new BehaviorSubject<any>(null);
  selectedTableEventSubject = new BehaviorSubject<any>(null);
  PavEventSubject = new BehaviorSubject<any>(null);
  getTableDataSubject = new BehaviorSubject<any>(null);

  // Update the drivingEvents data
  private drivingEventsDataSubject = new BehaviorSubject<any>(null);
  drivingEventsData$ = this.drivingEventsDataSubject.asObservable();

  updateDrivingEventsData(data: any) {
    this.drivingEventsDataSubject.next(data);
  }

  private apiURL = environment.API_BASE_PATH;
  constructor(private http: HttpClient) {}

  updateEventLoaded(data: any) {
    this.eventLoadedSubject.next(data);
  }

  updateSelectedEvent(event: any) {
    this.selectedTableEventSubject.next(event);
  }

  drivingEventsReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/get_driving_events_report`,
      formValues,
      { responseType: 'blob' }
    );
  }

  getTableData(data: any) {
    this.getTableDataSubject.next(data);
  }

  loadedPavMapEvent(data: any) {
    this.PavEventSubject.next(data);
  }
}
