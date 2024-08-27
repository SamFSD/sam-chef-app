import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from '../../services/global.service';
import { LoaderService } from '../../services/loader/loader.service';
import { ColorSchemeService } from '../../services/theme/color-scheme.service';
import { MenuComponent } from '../menu/menu.component';
import { Router } from '@angular/router';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { ApiService } from '../../services/auth-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild(MenuComponent) menuComponent!: MenuComponent;

  pageTitle = 'Kota Shop';
  isHandled: boolean = false;
  itemsData: any = [];

  constructor(
    public loaderService: LoaderService,
    public colorSchemeService: ColorSchemeService,
    public globalService: GlobalService,
    private api: ApiService,
    public route: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.api.getProtectedData().subscribe((res) => {
      this.itemsData = res;
      this.initTable();
    });

    this.globalService.titleUpdate.subscribe((title) => {
      this.pageTitle = title;
    });
  }

  initTable() {
    const table = new Tabulator("#inventory-table", {
      layout: 'fitColumns',
      height: "311px",
      data: this.itemsData,
      columns: [
        { title: "Item Name", field: "item_name", width: 150 },
        { title: "Description", field: "item_description" },
        { title: "Count", field: "item_count", hozAlign: "right" },
        { title: "Actions", field: "actions", formatter: this.actionFormatter.bind(this), cellClick: this.handleCellClick.bind(this) },
      ],
    });
  }

  actionFormatter(cell: any, formatterParams: any) {
    return `<button class="edit-btn">Edit</button><button class="delete-btn">Delete</button>`;
  }

  handleCellClick(e: any, cell: any) {
    if (e.target.classList.contains('edit-btn')) {
      this.openDialog('edit', cell.getRow().getData());
    } else if (e.target.classList.contains('delete-btn')) {
      this.deleteItem(cell.getRow().getData());
    }
  }

  openDialog(action: string, item: any) {
    // Implement dialog logic here for adding or editing
  }

  deleteItem(item: any) {
    this.api.deleteItem(item.item_name).subscribe(() => {
      this.itemsData = this.itemsData.filter((i: any) => i.item_name !== item.item_name);
      this.initTable();
    });
  }
}
