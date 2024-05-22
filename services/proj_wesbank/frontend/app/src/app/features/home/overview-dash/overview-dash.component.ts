import { Component, Input } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { divisions } from 'src/app/interfaces.interrface';

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-overview-dash',
  templateUrl: './overview-dash.component.html',
  styleUrls: ['./overview-dash.component.scss'],
})
export class OverviewDashComponent {
  @Input() division?: string;
  divisions?: divisions[];
  branches?: string[];
  constructor(
    private globalService: GlobalService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    
  }
  ngOnInit() {}
  getFormValues() {}
}
