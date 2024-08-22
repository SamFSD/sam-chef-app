// dashboard.component.ts (Standalone Component)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Dashboard } from './dashboard';
import { MaterialModule } from '../material/material.module';
import { BackendService } from '../api-service/backend.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet,MaterialModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  displayedColumns: string[] = ['id', 'name', 'description', 'price']; 
  dataSource = new MatTableDataSource<Dashboard>([]);

  constructor(private api: BackendService) { }

  ngOnInit(): void {
    this.api.getItems().subscribe(
      (items: Dashboard[]) => {
        this.dataSource.data = items;
      },
      error => {
        console.log('Error fetching items:', error);
      }
    );
  }
}