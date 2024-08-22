// dashboard.component.ts (Standalone Component)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Dashboard } from './dashboard';
import { MaterialModule } from '../material/material.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet,MaterialModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  displayedColumns: string[] = ['id', 'name', 'quantity', 'price'];
  dataSource = new MatTableDataSource<Dashboard>(ELEMENT_DATA);

  constructor() { }

  ngOnInit(): void {
    // Initialize or fetch data here if needed
  }
}

const ELEMENT_DATA: Dashboard[] = [
  { id: 1, name: 'Item 1', quantity: 10, price: 100 },
  { id: 2, name: 'Item 2', quantity: 5, price: 50 },
  { id: 3, name: 'Item 3', quantity: 8, price: 80 },
];
