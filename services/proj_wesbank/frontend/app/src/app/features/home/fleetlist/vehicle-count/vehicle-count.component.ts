import { Component } from '@angular/core';
import { FleetlistService } from 'src/app/core/api/api_service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-vehicle-count',
  templateUrl: './vehicle-count.component.html',
  styleUrls: ['./vehicle-count.component.scss'],
})
export class VehicleCountComponent {
  vehTypeCounts: any[] = [];
  apiSub: any;
  private readonly onDestroy = new Subject<void>();

  constructor(
    private api: FleetlistService,
    private smallForm: SmallFormService,
    private gs: GlobalService
  ) {}

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.vehicleCounts(this.smallForm.getFormValues());
        }
      });
  }

  vehicleCounts(form: any) {
    this.api
      .getFleetlistVehicleCountV0GetFleetlistVehicleCountPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.vehTypeCounts = res;
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });
  }
  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
