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




  public sideNavState: boolean = false;
  public linkText: boolean = false;




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
 
  }

  

  expandSidenav() {
    this.expandedSidenav = !this.expandedSidenav;
  }

  isMenuOpen() {
    return this.isMenuOpen;
  }
}
