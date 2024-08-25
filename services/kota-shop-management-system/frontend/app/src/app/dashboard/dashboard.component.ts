// dashboard.component.ts (Standalone Component)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { MaterialModule } from '../material/material.module';
import { BackendService } from '../api-service/backend.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,MaterialModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
}