import { Component, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  DriversEventsService,
  PerAssetsViewService,
} from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../small-form-component/small-form-interface';
import { SmallFormService } from '../small-form-component/small-form.service';
import { Position } from './events-maps/position';

@Component({
  selector: 'app-driving-events',
  templateUrl: './driving-events.component.html',
  styleUrls: ['./driving-events.component.scss'],
})
export class DrivingEventsComponent {
  @Input() isSingleReg = false;
  filteredEventDetails: Position[] = [];
  private readonly onDestroy = new Subject<void>();
  // prp that will hide and display the driving events top row in the pav page
  showTopRow: boolean = true;

  drivingEventsTopRow: any;
  biGaugesData: any;
  driversEventsStatsData: any;
  drivingEventsData: any;

  constructor(
    private smallForm: SmallFormService,
    private gs: GlobalService,
    private api: DriversEventsService,
    private pavApi: PerAssetsViewService
  ) {
    this.smallForm.formPage = 'events';
    this.smallForm.formLayoutType.next('full-page');
    //remove all other componetn top rows
    this.gs.disableTopRows();
    //show small form dates select
    this.smallForm.showDateSelectorDD.next(true);
    this.smallForm.showMappingDD.next(false);
    this.smallForm.showMake.next(true);
    this.smallForm.showSupplierDD.next(false);

    this.biGaugesData = {};
  }

  ngOnInit() {
    if (this.isSingleReg) {
      this.showTopRow = false;
    }
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.getDrivingEventsData(this.smallForm.getFormValues());
        }
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  getDrivingEventsData(form: smallForm) {
    /// if in the pav page and registratiion is single then hide the driving events top row
    if (this.isSingleReg) {
      this.showTopRow = false;
      /////////////// call all the api that will filter by single registration    /////////////

      // call api for bi gauges and per vehicle table
      this.pavApi
        .getBiScoresPavV0GetBiScoresPavPost(form)
        .pipe(takeUntil(this.onDestroy))
        .subscribe((res: any) => {
          // console.log('Bi Score Data row', res);
          this.biGaugesData = res.gauge_scores;
        });

      // / api call that gets the driving events table data
      this.pavApi
        .getPavDriversEventsTableV0GetPavDriversEventsTablePost(form)
        .subscribe({
          next: (res: any[]) => {
            this.drivingEventsData = res;
          },
          error: (err) => {
            this.gs.raiseError(err);
          },
          complete: () => {},
        });
    } else {
      /// api that gets the driving events top row table data
      this.api
        .getDriversStatsTopRowV0GetDriversStatsTopRowPost(form)
        .pipe(takeUntil(this.onDestroy))
        .subscribe((res: any) => {
          // console.log('Events top row', res);
          this.drivingEventsTopRow = res;
        });

      /// the api call thats gets the bi guages info
      // call api for bi gauges and per vehicle table
      this.api
        .getBiScoresV0GetBiScoresPost(form)
        .pipe(takeUntil(this.onDestroy))
        .subscribe((res: any) => {
          // console.log('Bi Score Data row', res);

          this.biGaugesData = res.gauge_scores;
          // console.log('bi scores', res);
        });

      // / api call that gets the driving events table data
      this.api
        .getDriversEventsTableV0GetDriversEventsTablePost(form)
        .subscribe({
          next: (res: any[]) => {
            // if (res.length <= 0) {
            // console.log(res, 'Driving Events Data');
            this.drivingEventsData = res;
          },

          error: (err) => {
            this.gs.raiseError(err);
          },
          complete: () => {},
        });
    }
  }
}
