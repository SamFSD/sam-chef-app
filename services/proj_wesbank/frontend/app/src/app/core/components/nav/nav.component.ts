import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from '../../services/global.service';
import { LoaderService } from '../../services/loader/loader.service';
import { ColorSchemeService } from '../../services/theme/color-scheme.service';
import { MenuComponent } from '../menu/menu.component';
import { Router } from '@angular/router';
import { SmallFormComponentComponent } from 'src/app/features/home/small-form-component/small-form-component.component';
import { ReportDownloadsComponent } from 'src/app/features/home/report-downloads/report-downloads.component';
import { FilterFormComponent } from '../filter-form/filter-form.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  // animations: [animateMainContent]
})
export class NavComponent {
  @ViewChild(MenuComponent) menuComponent!: MenuComponent;

  // expandedSidenav = false; // must add a click listerner into the html component

  pageTitle = 'Fleet Analytics';
  isHandled: boolean = false;

  constructor(
    public loaderService: LoaderService,
    public colorSchemeService: ColorSchemeService,
    public globalService: GlobalService,
    private changeDetectorRef: ChangeDetectorRef,
    public route: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.globalService.titleUpdate.subscribe((title) => {
      this.pageTitle = title;
      this.changeDetectorRef.detectChanges();
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(FilterFormComponent, {
      width: '100%',
      position: {top: '60px'},
      panelClass: 'custom-dialog-container'
    })
  }

  // expandSidenav() {
  //   this.menuComponent.expandedSidenav = !this.menuComponent.expandedSidenav;
  // }   refer to line 25

  getTheme() {
    return this.colorSchemeService.currentActive();
  }

  toggleTheme() {
    let newTheme = this.getTheme() === 'dark' ? 'light' : 'dark';
    // this.setTheme(newTheme);
  }

  showFiller = false;
}
