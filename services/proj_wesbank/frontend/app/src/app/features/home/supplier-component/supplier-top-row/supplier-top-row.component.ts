import { Component } from '@angular/core';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { SuppliersService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { Subject, take, takeUntil } from 'rxjs';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-supplier-top-row',
  templateUrl: './supplier-top-row.component.html',
  styleUrls: ['./supplier-top-row.component.scss'],
})
export class SupplierTopRowComponent {
  private readonly onDestroy = new Subject<void>();

  constructor(
    private smallFormService: SmallFormService,
    private api: SuppliersService,
    private gs: GlobalService
  ) {}
  totalCost: any;
  totalRepairCount: any;
  ngOnInit() {
    this.smallFormService.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallFormService.getFormValues());
        }
      });
  }

  callApi(form: smallForm) {
    this.api
      .sho002GetSupplierCostsAndCountsForTopTotalsV0Sho002GetSupplierCostsAndCountsForTopTotalsPost(
        form
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.totalCost = isNaN(res[0].cost) || res[0].cost === '' ? 0 : this.gs.toZAR(res[0].cost);
          this.totalRepairCount = res[0].count;
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
