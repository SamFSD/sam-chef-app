import { Component, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { SuppliersService } from 'src/app/core/api/api_service';
import {
  TabulatorFull as Tabulator
} from 'tabulator-tables';
@Component({
  selector: 'app-supplier-overview',
  templateUrl: './supplier-overview.component.html',
  styleUrls: ['./supplier-overview.component.scss'],
})
export class SupplierOverviewComponent {
  isLoading: boolean = false;
  @Input() division!: string;
  tableData: any;
  sankeyData: any;
  sankeyChartOptions: any;
  supplierTable: any;
  apiSub: any;
  constructor(private api: SuppliersService, private router: Router) {}
  ngOnInit() {  

    if (this.division) {
      //get table data
      this.getTableData(this.division);
      // get sankey data
      this.getSankeyData();
    }
  }

  ngOnChanges(change: SimpleChanges) {
    this.isLoading = true;
    if (change['division'] ) {
      this.getSankeyData();
      this.getTableData(change['division']);
    }
  }

  getTableData(form: any) {
    this.isLoading = true;
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
    this.apiSub = this.api
      .getSupplierTotalsTablePerDivisionV0GetSupplierTotalsTablePerDivisionPost(
        form
      )
      .subscribe((data) => {
        this.tableData = data;
        this.isLoading = false;
        this.generateTable(this.router);
      });
  }
  ngOnDestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }
  getSankeyData() {
    // this.api
    //   .getDivisionSupplierSankeyV0GetDivisionSupplierSankeyGet(this.division)
    //   .subscribe((data) => {
    //     this.sankeyData = data.sankey;
    //     this.generateSankeyChart();
    //   });
  }
  generateSankeyChart() {
    this.sankeyChartOptions = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      animation: true,
      series: {
        type: 'sankey',
        // orient: 'vertical',
        label: {
          position: 'left',
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

  generateTable(router: Router) {
    const tableColumns = Object.keys(this.tableData[0]).map((key) => ({
      title: key,
      field: key,
    }));

    this.supplierTable = new Tabulator('#supplier-table', {
      columns: tableColumns,
      data: this.tableData,
      pagination: true,
      paginationSize: 20,
      // paginationSizeSelector: [20, 50, 100],
      paginationInitialPage: 1,
      selectable: true,
    });

    this.supplierTable.on(
      'rowSelected',
      (tableRow: { _row: { data: { vehiclereg: any } } }) => {
        // const assetID = tableRow._row.data.vehiclereg;
        // router.navigate(['viewasset', assetID]);
      }
    );
  }
}
