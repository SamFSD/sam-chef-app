import { Component } from '@angular/core';
import { StatsPageService } from 'src/app/core/api/api_service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { Subject, takeUntil } from 'rxjs';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-stats-top-row',
  templateUrl: './stats-top-row.component.html',
  styleUrls: ['./stats-top-row.component.scss'],
})
export class StatsTopRowComponent {
  constructor(
    private api: StatsPageService,
    private smallForm: SmallFormService,
    private gs: GlobalService
  ) {}
  private readonly onDestroy = new Subject<void>();
  isLoading: boolean = true;

  supplierCost: any;
  supplierCPK: any;
  componentCost: any;
  componentCPK: any;
  assetCost: any;
  assetCPK: any;

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  callApi(form: smallForm) {
    this.isLoading = true;
    this.api
      .topRowOverviewV0TopRowOverviewPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.supplierCPK = this.gs.toCPK(response.supplier);
          this.componentCPK = this.gs.toCPK(response.component);
          this.assetCPK = this.gs.toCPK(response.vehicle);
        },
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
