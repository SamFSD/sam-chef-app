import { Injectable } from '@angular/core';
import { Observable, Subject, switchMap, timer, startWith, tap } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { MatDialog } from '@angular/material/dialog';
import { LogoutTimerComponent } from 'src/app/notifications/logout-timer/logout-timer.component';

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

  // monitor activity from the user
  monitorActivity() {
    this.inactivityTimer$ = this.userActivitySubject.pipe(
      /// on user activity reset the activity timer
      startWith('initialization'),
      switchMap(() =>
        timer(this.timeOutMinutes * 60 * 1000)),
      tap(() => {   
        this.openDialog(this.timeOutMinutes);
      })
    );

    // subscribe to activity timer
    this.inactivityTimer$.subscribe();

    // listen for user activity and restart logout timer
    ['click', 'mousemove', 'keydown'].forEach((event: any) => {
      window.addEventListener(event, () => {
        this.userActivitySubject.next(event);
      });
    });
  }

  openDialog(timer: number) {
    timer = 5000;
    this.dialog.open(LogoutTimerComponent, {
      data: { timer: timer },
    });
  }
}
