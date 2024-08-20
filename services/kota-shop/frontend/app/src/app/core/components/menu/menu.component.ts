import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { SideNavService } from '../../services/sidenav/sidenav.service';

import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { animateSideNav, animateText } from '../../animations/nav.animate';
import { GlobalService } from '../../services/global.service';

interface NavLink {
  icon: string;
  name: string;
  link: string;
}
interface navMenu {
  icon: string;
  name: string;
  link?: string;
  children: string[];
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [animateSideNav, animateText],
})
export class MenuComponent implements OnInit {
  isSidenavExpanded = false;
  @ViewChild('navMenu', { static: true }) navMenu!: MatMenuTrigger;
  @Input() isExpanded: boolean = false;
  @Output() toggleMenu = new EventEmitter();
  @Output() showForm = new Subject<boolean>();
  isAllowedDelete: boolean = false;
  expandedSidenav = true;

  //show drivers events top row
  showDriversEventsTopRow: boolean = false;
  // show fleetcard top row
  showFleetCardTopRow: boolean = false;

  // show the top row of the Orders page
  shoOrdersPageTopRow: boolean = false;
  // show the top row of the landing page
  showLandingPageTopRow: boolean = false;
  // show the top row of the component page
  showComponentPageTopRow: boolean = false;
  // show the top row of the invoice status page
  showInvStatusTopRow: boolean = false;
  // show cpk usage top row
  showCPKUsageTopRow: boolean = false;
  // show supplier top row
  showSupplierTopRow: boolean = false;
  // show expirations top row
  showExpirationsTopRow: boolean = false;
  // show PAV top row
  showPavTopRow: boolean = false;
  // show stats top row
  showStatsTopRow: boolean = false;
  // show expirations top row
  showSmallForm: boolean = false;

  //show odo scatter plot graph
  showScatterPlotGraph: boolean = false;

  //show fleetlist vehicle count top row
  showFleetlistVehicleCountTopRow: boolean = false;

  //Orders balancing top row
  showOrdersBalancesTopRow: boolean = false;

  // hide all top rows and set form to full width
  hideAllTopRows: boolean = false;
  layoutType: 'full-page' | 'compact' = 'compact';
  //show  Dashboard top row
  showDashboardTopRow: boolean = false;

  public sideNavState: boolean = false;
  public linkText: boolean = false;
  public activeNav: NavLink | null = null;

  public overviewNavs: NavLink[] = [
    {
      name: 'Dashboard ',
      icon: 'account_balance',
      link: '/dashboard',
    },

    {
      name: 'Home ',
      icon: 'home',
      link: '/home',
    },

    {
      name: 'Fleetlist',
      icon: 'local_shipping',
      link: '/fleetlist',
    },
    {
      name: 'FleetCard',
      icon: 'ballot',
      link: '/Fleetcard',
    },
    {
      name: 'Repair Type',
      icon: 'build',
      link: '/repair-types',
    },
    {
      name: 'Usage',
      icon: 'receipt',
      link: '/usage',
    },

    {
      name: 'Components',
      icon: 'blur_linear',
      link: '/component-details',
    },
    {
      name: 'Suppliers',
      icon: 'shopping_cart',
      link: '/supplier',
    },
    {
      name: 'Expirations',
      icon: 'event_busy',
      link: '/expirations',
    },

    {
      icon: 'dashboard',
      name: 'Orders',
      link: '/orders/wesbank-orders',
    },

    {
      name: 'Reports',
      icon: 'cloud_download',
      link: '/reports',
    },

    {
      icon: 'directions_car',
      name: 'Asset View',
      link: '/viewasset',
    },
    {
      name: 'Driving Events',
      icon: 'shutter_speed',
      link: '/driving-event',
    },
    {
      name: 'Statistical Breakdown',
      icon: 'trending_up',
      link: '/stats',
    },
    {
      name: 'Downtime Tracker',
      icon: 'departure_board',
      link: '/downtime',
    },
  ];
  landingPageFilterForm: any;

  constructor(
    public router: Router,
    private _sidenavService: SideNavService,
    private gs: GlobalService,
  ) {
   
  }

  openDivisionDetailed() {
    this.router.navigate(['/viewdivision/noneSelected']);
  }
  ngOnInit(): void {
    //check to see if we have to sdhow landing page top row stats

    this.gs.showOrdersPageTop.subscribe(
      (show: boolean) => (this.shoOrdersPageTopRow = show)
    );

    this.gs.showFleetCardTop.subscribe(
      (show: boolean) => (this.showFleetCardTopRow = show)
    );

    this.gs.showDriversEventsTop.subscribe(
      (show: boolean) => (this.showDriversEventsTopRow = show)
    );

    this.gs.showLandingPageTop.subscribe(
      (show: boolean) => (this.showLandingPageTopRow = show)
    );
    this.gs.showCPKUsageTop.subscribe((show: boolean) => {
      this.showCPKUsageTopRow = show;
    });
    this.gs.showComponentPageTop.subscribe(
      (show: boolean) => (this.showComponentPageTopRow = show)
    );
    this.gs.showSmallForm.subscribe((show: boolean) => {
      this.showSmallForm = show;
    });
    this.gs.showInvStatusPageTop.subscribe((show: boolean) => {
      this.showInvStatusTopRow = show;
    });
    this.gs.showSupplierTopRow.subscribe((show: boolean) => {
      this.showSupplierTopRow = show;
    });
    this.gs.showExpirationsPageTop.subscribe((show: boolean) => {
      this.showExpirationsTopRow = show;
    });

    this.gs.showFleetlistVehicleCountTopRow.subscribe((show: boolean) => {
      this.showFleetlistVehicleCountTopRow = show;
    });

    this.gs.showOrdersBalancesTopRow.subscribe((show: boolean) => {
      this.showOrdersBalancesTopRow = show;
    });

    //dashboard to row
    this.gs.showDashboardTopRow.subscribe((show: boolean) => {
      this.showDashboardTopRow = show;
    });

    this.gs.showPavTopRow.subscribe((show: boolean) => {
      this.showPavTopRow = show;
    });
    this.gs.showStatsTop.subscribe((show: boolean) => {
      this.showStatsTopRow = show;
    });
  }

  navigate(link: string) {
    this.router.navigateByUrl(link);
  }
  toggleLinks(nav: NavLink) {
    if (this.activeNav === nav) {
      this.activeNav = null;
    } else {
      this.activeNav = nav;
    }
  }

  expandSidenav() {
    this.expandedSidenav = !this.expandedSidenav;
  }

  isMenuOpen() {
    return this.isMenuOpen;
  }
}
