import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StatsPageService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../../small-form-component/small-form-interface';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-stats-sankey',
  templateUrl: './stats-sankey.component.html',
  styleUrls: ['./stats-sankey.component.scss'],
})
export class StatsSankeyComponent {
  constructor(
    private api: StatsPageService,
    private smallForm: SmallFormService,
    private activatedRoute: ActivatedRoute,
    private gs: GlobalService
  ) {}
  private readonly onDestroy = new Subject<void>();
  isLoading: boolean = true;
  vehicleNames!: any;
  vehicleLinks!: any;
  trailerNames!: any;
  trailerLinks!: any;
  viewTrailers: boolean = false;
  statsSankey: any;
  singleAsset!: boolean;

  ngOnInit() {
    this.checkPage();
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
      .statsSankeyV0StatsSankeyPost(this.singleAsset, form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.vehicleNames = response.vehicle_names;
          this.vehicleLinks = response.vehicle_links;
          this.trailerNames = response.trailer_names;
          this.trailerLinks = response.trailer_links;

          if (
            this.singleAsset &&
            this.vehicleNames.length < this.trailerNames.length
          )
            this.viewTrailers = true;

          if (!this.viewTrailers) {
            this.generateSankey(this.vehicleNames, this.vehicleLinks);
          } else {
            this.generateSankey(this.trailerNames, this.trailerLinks);
          }
        },
      });
  }

  generateSankey(names: any, links: any) {
    this.statsSankey = {
      series: {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'trajectory',
        },
        data: names,
        links: links,
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params: any) => {
          const value = params.value;
          return this.viewTrailers
            ? this.gs.toZAR(value)
            : this.gs.toCPK(value);
        },
      },
    };
  }

  onAssetToggle() {
    this.viewTrailers = !this.viewTrailers;
    if (this.viewTrailers) {
      this.generateSankey(this.trailerNames, this.trailerLinks);
    } else {
      this.generateSankey(this.vehicleNames, this.vehicleLinks);
    }
  }

  private checkPage(): void {
    const url = this.activatedRoute.snapshot.url[0]?.path;

    switch (url) {
      case 'viewasset':
        this.singleAsset = true;
        break;
      case 'stats':
        this.singleAsset = false;
        break;
    }
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
