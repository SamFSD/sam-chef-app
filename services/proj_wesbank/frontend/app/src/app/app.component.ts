import { Component } from '@angular/core';
import { NavigationEnd, Router, Event as RouterEvent } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { filter } from 'rxjs/operators';
import { ActivityTrackerService } from './core/services/activity-tracker.service';
import { ColorSchemeService } from './core/services/theme/color-scheme.service';
import { SmallFormService } from './features/home/small-form-component/small-form.service';


// interface Gtag {
//   (command: 'config', targetId: string, params?: object): void;
//   (command: 'event', action: string, params?: object): void;
// }

// declare var gtag: Gtag;
declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  counter = 10;
  title = 'Wesbank Fleet Analytics';


  

  constructor(
    public auth: AuthService,
    private themeService: ColorSchemeService,
    private router: Router,
    private activityTracker: ActivityTrackerService,
    private smallForm: SmallFormService
  ) {
    this.themeService.load();
    const navEndEvents$ = this.router.events.pipe(
      filter(
        (event: RouterEvent): event is NavigationEnd =>
          event instanceof NavigationEnd
      )
    );
    navEndEvents$.subscribe((event: NavigationEnd) => {
      gtag('config', 'G-MPTQG3XH5X', { page_path: event.urlAfterRedirects });
    });
    /// monitor activity and auto logout if user is inactive on the portal

    this.activityTracker.monitorActivity();

    //
  }

  ngOnInit(): void {
    // on user login send user properties to Google Analytics
    this.auth.isAuthenticated$.subscribe(
      (isLoggedIn: boolean) => {
        if (isLoggedIn) {
          this.auth.user$.subscribe((profile) => {
            //check if perms in storage
            const cachedPermissions = localStorage.getItem('userPermissions');
            if (cachedPermissions) {

              gtag('event', 'login', {
                event_category: 'Login',
                login_branch: JSON.parse(cachedPermissions)[0].branch,
              });
            } else {
              this.smallForm
                .getUserPermissions()
                .subscribe((userPermissions: any) => {
                  gtag('event', 'login', {
                    event_category: 'Login',
                    login_branch: userPermissions[0].branch,
                  });
                });
            }
          });
        }
      }
      // Get user permissions based on email from auth0
      // this.smallForm.getUserPermissions(profile.email)
    );
  }
}
