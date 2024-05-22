import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-dashboard-tables',
  templateUrl: './dashboard-tables.component.html',
  styleUrls: ['./dashboard-tables.component.scss'],
})
export class DashboardTablesComponent {
  isLoading: boolean = false;

  apiSub: any;

  private readonly onDestroy = new Subject<void>();

  constructor(
    private gs: GlobalService,
    private router: Router
  ) {}

  ngOnInit() {
    //init tabulator table


    this.isLoading = true;
  }

  ngOnDestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }
}
