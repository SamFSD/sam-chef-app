import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CellComponent } from 'tabulator-tables';

@Injectable({
  providedIn: 'root'
})
export class TabFormatService {
  private rowDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public rowData$ = this.rowDataSubject.asObservable();

  constructor(
    private router: Router) { }





  customButtonFormatter(
    cell: CellComponent,
    formatterParams: any,
    onRendered: () => void
  ): string {
    const icon = formatterParams.icon || '';
    return `<div style="font-size: 14px;" class="material-icons">${icon}</div>`;
  }

}
