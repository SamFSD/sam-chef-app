import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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
  // animations: [animateMainContent]
})
export class DashboardComponent {
  @ViewChild(MenuComponent) menuComponent!: MenuComponent;



  pageTitle = 'Kota Shop';
  isHandled: boolean = false;
  itemsData: any;

  constructor(
    public loaderService: LoaderService,
    public colorSchemeService: ColorSchemeService,
    public globalService: GlobalService,
    private changeDetectorRef: ChangeDetectorRef,
    public route: Router,
    public dialog: MatDialog
    , private api: ApiService
  ) {}

  ngOnInit() {
    this.api.getProtectedData().subscribe((res)=>{
      console.log(res,"i hope to get items")
      res = this.itemsData
    })

    this.globalService.titleUpdate.subscribe((title) => {
      this.pageTitle = title;
      this.changeDetectorRef.detectChanges();
    });
    type TabulatorLayout = 'fitColumns';

    var table = new Tabulator("#inventory-table", {
      layout: 'fitColumns' as TabulatorLayout,
      height:"311px",
      data: this.itemsData,
      columns: [
        { title: "Item Name", field: "item_name", width: 150 },
        { title: "Description", field: "item_description" },
        { title: "Count", field: "item_count", hozAlign: "right" },
      ],
  });
  }

  openDialog() {
 
  }


  getTheme() {
    return this.colorSchemeService.currentActive();
  }

  toggleTheme() {
    // let newTheme = this.getTheme() === 'dark' ? 'light' : 'dark';
    
  }

  showFiller = false;
}
