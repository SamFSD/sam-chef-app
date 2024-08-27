import { Component, Inject, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { Subject, takeUntil } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-logout-timer',
  templateUrl: './logout-timer.component.html',
  styleUrls: ['./logout-timer.component.scss']
})
export class LogoutTimerComponent {
  private readonly onDestroy = new Subject<void>();

  private timerSubscription!: Subscription

  countDown: number = 5*60;
  testDate: number = 57;
  formattedCountDown: string = '';

  constructor(@Inject(DOCUMENT) private doc: Document, private auth: AuthService, private dialog: MatDialog) { }
  
  ngOnInit(){
    this.counterDown();
  }

  formatToMMSS(seconds: number) {
    // Calculate minutes and seconds
    let minutes = Math.floor(seconds / 60);
    let remainderSeconds = seconds % 60;

    // Convert to MM:SS format
    let result = `${minutes.toString().padStart(2, '0')}:${remainderSeconds.toString().padStart(2, '0')}`;
    return result;
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  counterDown() {
    this.timerSubscription = interval(1000).pipe(takeUntil(this.onDestroy)).subscribe(() => {
      this.countDown--;
      //convert countdown number to MM:SS
      this.formattedCountDown = this.formatToMMSS(this.countDown);
      if (this.countDown === 0) {
        this.auth.logout({ returnTo: this.doc.location.origin });
        this.timerSubscription.unsubscribe();
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}