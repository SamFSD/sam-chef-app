import { Component } from '@angular/core';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { SuppliersService } from 'src/app/core/api/api_service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-supplier-sankey',
  templateUrl: './supplier-sankey.component.html',
  styleUrls: ['./supplier-sankey.component.scss'],
})
export class SupplierSankeyComponent {
  isLoading: boolean = true;
  sankeyData: any;
  sankeyChartOptions: any;
  apiSub: any;
  constructor(
    private smallFormService: SmallFormService,
    private api: SuppliersService
  ) {}

  ngOnInit() {
    //get form values on init
    this.callApi(this.smallFormService.getFormValues());
    // subscribe to form changes and update
    this.smallFormService.landingPgFormUpdated.subscribe((form) => {
      this.callApi(form);
    });
  }

  callApi(form: smallForm) {
    this.isLoading = true;
    //  this.api
    //       .getSupplierSankeyV0GetSupplierSankeyPost(form)
    //       .subscribe((data: any) => {
    //         this.sankeyData = data.sankey;
    //         this.isLoading = false;
    //         this.generateSankeyChart();
    //       });
  }

  ngOnDestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }

  generateSankeyChart() {
    this.sankeyChartOptions = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      color: ['#f39200', '#7c878e', '#69d2dc'],
      animation: true,
      series: {
        type: 'sankey',
        // orient: 'vertical',
        label: {
          position: 'left',
          fontSize: '8',
        },
        lineStyle: {
          color: 'source',
          curveness: 0.5,
        },
        emphasis: {
          focus: 'adjacency',
        },
        data: this.sankeyData.data,
        links: this.sankeyData.links,
      },
    };
  }
}
