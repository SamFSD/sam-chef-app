import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Dashboard } from '../dashboard';
import { BackendService } from '../../api-service/backend.service';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
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
