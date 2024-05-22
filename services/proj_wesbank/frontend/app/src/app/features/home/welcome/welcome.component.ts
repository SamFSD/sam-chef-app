import { Component } from '@angular/core';

interface NavLink {
  icon: string;
  name: string;
  link: string;
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

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

}
