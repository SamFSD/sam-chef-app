import { Injectable } from '@angular/core';
import { Observable, Subject, switchMap, timer, startWith, tap } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class ActivityTrackerService {
  constructor(private auth: AuthService, private dialog: MatDialog) {}

  /// time out
  private timeOutMinutes = 5;
  // a subject that gets user activities
  private userActivitySubject = new Subject();
  /// inactivity timer
  private inactivityTimer$!: Observable<number>;

 

  


}
