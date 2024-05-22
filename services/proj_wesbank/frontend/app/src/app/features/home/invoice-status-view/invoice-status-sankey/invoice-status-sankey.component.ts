import { Component } from '@angular/core';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { InvoiceStatusService } from 'src/app/core/api/api_service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-invoice-status-sankey',
  templateUrl: './invoice-status-sankey.component.html',
  styleUrls: ['./invoice-status-sankey.component.scss'],
})
export class InvoiceStatusSankeyComponent {
  isLoading: boolean = false;
  nodes = [
    { name: 'completed', level: 0 },
    { name: 'order_exception_cost', level: 0 },
    { name: 'accruals', level: 0 },
    { name: 'invoice_exception_cost', level: 0 },
    { name: 'ITS A BRAKE', level: 1 },
    { name: 'YENDIS REF TEC PTY LTD', level: 1 },
    { name: 'N-TECH DIESEL', level: 1 },
    { name: 'DEKRA WESTERN CAPE', level: 1 },
    { name: 'FIRE QUIP', level: 1 },
    { name: 'COMMERCIAL AUTO GLASS', level: 1 },
    { name: 'ZENZELE TRUCK BODIES (PTY) LTD', level: 1 },
    { name: 'RANDBURG DIESEL AND TURBO', level: 1 },
    { name: 'LIMPOPO TRUCK & ELECTRICAL (PTY) LTD', level: 1 },
    { name: 'AUTO & TRUCK TYRE WADEVILL', level: 1 },
    { name: 'BIDVEST MCCARTHY COMMERCIAL VEHICLES BOKSBURG', level: 1 },
    { name: 'RIEKS TOWING (PTY) LTD', level: 1 },
    { name: 'FLEETQUIP', level: 1 },
    { name: 'UD TRUCKS MAGNIS PRETORA EAST', level: 1 },
    { name: 'SERCO SOLUTIONS (PTY) LTD', level: 1 },
    { name: 'CAR TOWING SERV INTERNATIONAL', level: 1 },
    { name: 'SANDOWN COMMERICAL VEHICLE', level: 1 },
    { name: 'NWT JOHANNESBURG', level: 1 },
    { name: 'BB TRUCK MIDDELBURG (PTY) LTD', level: 1 },
    { name: 'S/C TRYSOME AUTO ELECTRICAL', level: 1 },
    { name: 'CLAYVILLE TESTING CENTRE CC', level: 1 },
    { name: 'TYRE CHOICE CC', level: 1 },
    { name: 'AMS TECHNOLOGIES (PTY) LTD', level: 1 },
    { name: 'SCANIA SOUTH AFRICA (PTY) LTD', level: 1 },
    { name: 'NORTH POINT COMPOSITE BODIES PTY LTD', level: 1 },
    { name: 'TRUCK CARE', level: 1 },
    { name: 'UD BB TRUCK PRETORIA', level: 1 },
    { name: 'ALDERWOOD TRADING 73', level: 1 },
    { name: 'ROUTE MANAGEMENT-TRANSREP', level: 1 },
    { name: 'MAGNIS TRUCKS SAMRAND', level: 1 },
    { name: 'UD TRUCKS KLERKSDORP', level: 1 },
    { name: 'UD - BB TRUCK MIDDELBURG PTY LTD', level: 1 },
    { name: 'TYREMART CENTURION CBD', level: 1 },
    { name: 'ONSITE TRAILER (PTY) LTD', level: 1 },
    { name: 'UD MAGNIS TRUCKS BLOEMFONTEIN', level: 1 },
    { name: 'PHAS-1 LOCK AND KEY CENTRE (PTY) LTD', level: 1 },
    { name: 'TIGER WHEEL & TYRE (PTY) LTD', level: 1 },
    { name: 'CENTURION LAKE AUTO', level: 1 },
    { name: 'TAIL LIFTS & REFRIGERATION SOL', level: 1 },
    { name: 'VTSSA NI', level: 1 },
    { name: 'SANS SOUCI TOWING (PTY) LTD', level: 1 },
    { name: 'TRANSFRIG', level: 1 },
    { name: 'A & J SERVICES', level: 1 },
    { name: 'SPECIALISED TARPAULIN SERVICES PTY LTD', level: 1 },
    { name: 'AC & R REFRIGERATION SERVICES CC', level: 1 },
    { name: 'SERCO EASTERN CAPE (PTY) LTD S/C', level: 1 },
    { name: 'RESURGENT ENERGY (PTY) LTD', level: 1 },
    { name: 'DUVALO (PTY) LTD', level: 1 },
    { name: 'VAN WETTENS BREAKDOWN SERVICES', level: 1 },
    { name: 'PIRTEK PRETORIA (PTY) LTD', level: 1 },
    { name: 'S/C BIDVEST MCCARTHY HINO MIDRAND', level: 1 },
    { name: 'GEARBOXES A-Z CC', level: 1 },
    { name: 'D COMMERCIAL AUTO BODY PTY LTD', level: 1 },
    { name: 'UD TRUCKS LICHTENBURG', level: 1 },
    { name: 'VOLVO GROUP SOUTHERN AFRICA', level: 1 },
    { name: 'BNH AIR BRAKES CC', level: 1 },
    { name: 'WEARCHECK', level: 1 },
    { name: 'GP REPAIRS AND MAINTENANCE PTY LTD', level: 1 },
    { name: 'PECSSER (PTY) LTD', level: 1 },
  ];
  sankeyData = [
    { source: 'ITS A BRAKE', target: 'completed', value: 2928084.18 },
    { source: 'ITS A BRAKE', target: 'accruals', value: 198130.28 },
    {
      source: 'ITS A BRAKE',
      target: 'invoice_exception_cost',
      value: 480369.96,
    },
    { source: 'YENDIS REF TEC PTY LTD', target: 'completed', value: 3756.5 },
    {
      source: 'YENDIS REF TEC PTY LTD',
      target: 'invoice_exception_cost',
      value: 3756.5,
    },
    { source: 'N-TECH DIESEL', target: 'completed', value: 17750.17 },
    { source: 'N-TECH DIESEL', target: 'accruals', value: 1300.0 },
    {
      source: 'N-TECH DIESEL',
      target: 'invoice_exception_cost',
      value: 19050.17,
    },
    { source: 'DEKRA WESTERN CAPE', target: 'completed', value: 414.95 },
    { source: 'DEKRA WESTERN CAPE', target: 'accruals', value: 476.52 },
    {
      source: 'DEKRA WESTERN CAPE',
      target: 'invoice_exception_cost',
      value: 891.47,
    },
    { source: 'FIRE QUIP', target: 'completed', value: 76936.0 },
    { source: 'FIRE QUIP', target: 'accruals', value: 28541.0 },
    { source: 'COMMERCIAL AUTO GLASS', target: 'completed', value: 213216.47 },
    { source: 'COMMERCIAL AUTO GLASS', target: 'accruals', value: 27973.74 },
    {
      source: 'COMMERCIAL AUTO GLASS',
      target: 'invoice_exception_cost',
      value: 51739.15,
    },
    {
      source: 'ZENZELE TRUCK BODIES (PTY) LTD',
      target: 'completed',
      value: 11569.8,
    },
    {
      source: 'ZENZELE TRUCK BODIES (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 11569.8,
    },
    {
      source: 'RANDBURG DIESEL AND TURBO',
      target: 'completed',
      value: 142693.0,
    },
    { source: 'RANDBURG DIESEL AND TURBO', target: 'accruals', value: 8002.0 },
    {
      source: 'RANDBURG DIESEL AND TURBO',
      target: 'invoice_exception_cost',
      value: 53826.0,
    },
    {
      source: 'LIMPOPO TRUCK & ELECTRICAL (PTY) LTD',
      target: 'completed',
      value: 3933.76,
    },
    {
      source: 'LIMPOPO TRUCK & ELECTRICAL (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 3933.76,
    },
    {
      source: 'AUTO & TRUCK TYRE WADEVILL',
      target: 'completed',
      value: 492942.75,
    },
    {
      source: 'AUTO & TRUCK TYRE WADEVILL',
      target: 'accruals',
      value: 15015.8,
    },
    {
      source: 'AUTO & TRUCK TYRE WADEVILL',
      target: 'invoice_exception_cost',
      value: 4452.6,
    },
    {
      source: 'BIDVEST MCCARTHY COMMERCIAL VEHICLES BOKSBURG',
      target: 'completed',
      value: 26742.96,
    },
    {
      source: 'BIDVEST MCCARTHY COMMERCIAL VEHICLES BOKSBURG',
      target: 'invoice_exception_cost',
      value: 26742.96,
    },
    { source: 'RIEKS TOWING (PTY) LTD', target: 'completed', value: 10350.0 },
    {
      source: 'RIEKS TOWING (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 10350.0,
    },
    { source: 'FLEETQUIP', target: 'completed', value: 2769.6 },
    { source: 'FLEETQUIP', target: 'invoice_exception_cost', value: 2769.6 },
    {
      source: 'UD TRUCKS MAGNIS PRETORA EAST',
      target: 'completed',
      value: 40375.47,
    },
    {
      source: 'UD TRUCKS MAGNIS PRETORA EAST',
      target: 'invoice_exception_cost',
      value: 40375.47,
    },
    {
      source: 'SERCO SOLUTIONS (PTY) LTD',
      target: 'completed',
      value: 2560693.51,
    },
    {
      source: 'SERCO SOLUTIONS (PTY) LTD',
      target: 'accruals',
      value: 103412.4,
    },
    {
      source: 'SERCO SOLUTIONS (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 79175.97,
    },
    {
      source: 'CAR TOWING SERV INTERNATIONAL',
      target: 'completed',
      value: 9417.5,
    },
    {
      source: 'CAR TOWING SERV INTERNATIONAL',
      target: 'invoice_exception_cost',
      value: 9417.5,
    },
    {
      source: 'SANDOWN COMMERICAL VEHICLE',
      target: 'completed',
      value: 22490.93,
    },
    { source: 'NWT JOHANNESBURG', target: 'completed', value: 6300.0 },
    {
      source: 'NWT JOHANNESBURG',
      target: 'invoice_exception_cost',
      value: 6300.0,
    },
    {
      source: 'BB TRUCK MIDDELBURG (PTY) LTD',
      target: 'completed',
      value: 2173869.47,
    },
    {
      source: 'BB TRUCK MIDDELBURG (PTY) LTD',
      target: 'accruals',
      value: 97493.69,
    },
    {
      source: 'BB TRUCK MIDDELBURG (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 48594.21,
    },
    {
      source: 'S/C TRYSOME AUTO ELECTRICAL',
      target: 'completed',
      value: 2303950.81,
    },
    {
      source: 'S/C TRYSOME AUTO ELECTRICAL',
      target: 'accruals',
      value: 1342020.22,
    },
    {
      source: 'S/C TRYSOME AUTO ELECTRICAL',
      target: 'invoice_exception_cost',
      value: 468240.43,
    },
    {
      source: 'CLAYVILLE TESTING CENTRE CC',
      target: 'completed',
      value: 264879.55,
    },
    {
      source: 'CLAYVILLE TESTING CENTRE CC',
      target: 'accruals',
      value: 11521.75,
    },
    {
      source: 'CLAYVILLE TESTING CENTRE CC',
      target: 'invoice_exception_cost',
      value: 5286.96,
    },
    { source: 'TYRE CHOICE CC', target: 'completed', value: 750.0 },
    {
      source: 'TYRE CHOICE CC',
      target: 'invoice_exception_cost',
      value: 750.0,
    },
    {
      source: 'AMS TECHNOLOGIES (PTY) LTD',
      target: 'completed',
      value: 236612.47,
    },
    {
      source: 'AMS TECHNOLOGIES (PTY) LTD',
      target: 'accruals',
      value: 58233.77,
    },
    {
      source: 'SCANIA SOUTH AFRICA (PTY) LTD',
      target: 'completed',
      value: 685830.23,
    },
    {
      source: 'SCANIA SOUTH AFRICA (PTY) LTD',
      target: 'accruals',
      value: 18660.9,
    },
    {
      source: 'SCANIA SOUTH AFRICA (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 94266.23,
    },
    {
      source: 'NORTH POINT COMPOSITE BODIES PTY LTD',
      target: 'completed',
      value: 18732.0,
    },
    {
      source: 'NORTH POINT COMPOSITE BODIES PTY LTD',
      target: 'invoice_exception_cost',
      value: 18732.0,
    },
    { source: 'TRUCK CARE', target: 'completed', value: 540567.09 },
    { source: 'TRUCK CARE', target: 'order_exception_cost', value: 48615.41 },
    { source: 'TRUCK CARE', target: 'accruals', value: 122028.35 },
    { source: 'TRUCK CARE', target: 'invoice_exception_cost', value: 15621.6 },
    { source: 'UD BB TRUCK PRETORIA', target: 'completed', value: 4853.9 },
    { source: 'UD BB TRUCK PRETORIA', target: 'accruals', value: 2679.4 },
    {
      source: 'UD BB TRUCK PRETORIA',
      target: 'invoice_exception_cost',
      value: 7533.3,
    },
    { source: 'ALDERWOOD TRADING 73', target: 'completed', value: 7202469.47 },
    { source: 'ALDERWOOD TRADING 73', target: 'accruals', value: 317611.35 },
    {
      source: 'ALDERWOOD TRADING 73',
      target: 'invoice_exception_cost',
      value: 270182.88,
    },
    {
      source: 'ROUTE MANAGEMENT-TRANSREP',
      target: 'completed',
      value: 5978201.93,
    },
    {
      source: 'ROUTE MANAGEMENT-TRANSREP',
      target: 'accruals',
      value: 212823.06,
    },
    {
      source: 'ROUTE MANAGEMENT-TRANSREP',
      target: 'invoice_exception_cost',
      value: 49941.94,
    },
    { source: 'MAGNIS TRUCKS SAMRAND', target: 'completed', value: 14269.9 },
    { source: 'MAGNIS TRUCKS SAMRAND', target: 'accruals', value: 4132.5 },
    {
      source: 'MAGNIS TRUCKS SAMRAND',
      target: 'invoice_exception_cost',
      value: 18402.4,
    },
    { source: 'UD TRUCKS KLERKSDORP', target: 'completed', value: 4278.17 },
    {
      source: 'UD TRUCKS KLERKSDORP',
      target: 'invoice_exception_cost',
      value: 4278.17,
    },
    {
      source: 'UD - BB TRUCK MIDDELBURG PTY LTD',
      target: 'completed',
      value: 4961.44,
    },
    {
      source: 'UD - BB TRUCK MIDDELBURG PTY LTD',
      target: 'invoice_exception_cost',
      value: 4961.44,
    },
    { source: 'TYREMART CENTURION CBD', target: 'completed', value: 1098.96 },
    {
      source: 'TYREMART CENTURION CBD',
      target: 'invoice_exception_cost',
      value: 1098.96,
    },
    { source: 'ONSITE TRAILER (PTY) LTD', target: 'completed', value: 15829.0 },
    {
      source: 'ONSITE TRAILER (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 15829.0,
    },
    {
      source: 'UD MAGNIS TRUCKS BLOEMFONTEIN',
      target: 'completed',
      value: 1300.0,
    },
    {
      source: 'UD MAGNIS TRUCKS BLOEMFONTEIN',
      target: 'invoice_exception_cost',
      value: 1300.0,
    },
    {
      source: 'PHAS-1 LOCK AND KEY CENTRE (PTY) LTD',
      target: 'completed',
      value: 50404.0,
    },
    {
      source: 'PHAS-1 LOCK AND KEY CENTRE (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 3400.0,
    },
    {
      source: 'TIGER WHEEL & TYRE (PTY) LTD',
      target: 'completed',
      value: 2705.09,
    },
    {
      source: 'TIGER WHEEL & TYRE (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 2705.09,
    },
    { source: 'CENTURION LAKE AUTO', target: 'completed', value: 20311.0 },
    {
      source: 'CENTURION LAKE AUTO',
      target: 'invoice_exception_cost',
      value: 20311.0,
    },
    {
      source: 'TAIL LIFTS & REFRIGERATION SOL',
      target: 'completed',
      value: 36269.61,
    },
    {
      source: 'TAIL LIFTS & REFRIGERATION SOL',
      target: 'invoice_exception_cost',
      value: 36269.61,
    },
    { source: 'VTSSA NI', target: 'completed', value: 27589.07 },
    { source: 'VTSSA NI', target: 'accruals', value: 5452.26 },
    { source: 'VTSSA NI', target: 'invoice_exception_cost', value: 330.44 },
    {
      source: 'SANS SOUCI TOWING (PTY) LTD',
      target: 'completed',
      value: 147738.5,
    },
    {
      source: 'SANS SOUCI TOWING (PTY) LTD',
      target: 'accruals',
      value: 16839.82,
    },
    {
      source: 'SANS SOUCI TOWING (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 164578.32,
    },
    { source: 'TRANSFRIG', target: 'completed', value: 811593.9 },
    { source: 'TRANSFRIG', target: 'order_exception_cost', value: 134387.85 },
    { source: 'TRANSFRIG', target: 'accruals', value: 11492.61 },
    { source: 'TRANSFRIG', target: 'invoice_exception_cost', value: 75497.54 },
    { source: 'A & J SERVICES', target: 'completed', value: 16222.5 },
    {
      source: 'A & J SERVICES',
      target: 'invoice_exception_cost',
      value: 16222.5,
    },
    {
      source: 'SPECIALISED TARPAULIN SERVICES PTY LTD',
      target: 'completed',
      value: 31597.0,
    },
    {
      source: 'SPECIALISED TARPAULIN SERVICES PTY LTD',
      target: 'accruals',
      value: 6895.0,
    },
    {
      source: 'AC & R REFRIGERATION SERVICES CC',
      target: 'completed',
      value: 6102983.82,
    },
    {
      source: 'AC & R REFRIGERATION SERVICES CC',
      target: 'accruals',
      value: 197127.67,
    },
    {
      source: 'AC & R REFRIGERATION SERVICES CC',
      target: 'invoice_exception_cost',
      value: 837253.8,
    },
    {
      source: 'SERCO EASTERN CAPE (PTY) LTD S/C',
      target: 'completed',
      value: 850.0,
    },
    {
      source: 'RESURGENT ENERGY (PTY) LTD',
      target: 'completed',
      value: 1100728.09,
    },
    {
      source: 'RESURGENT ENERGY (PTY) LTD',
      target: 'accruals',
      value: 152526.47,
    },
    {
      source: 'RESURGENT ENERGY (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 249269.14,
    },
    { source: 'DUVALO (PTY) LTD', target: 'completed', value: 69443.0 },
    {
      source: 'DUVALO (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 18173.0,
    },
    {
      source: 'VAN WETTENS BREAKDOWN SERVICES',
      target: 'completed',
      value: 41832.28,
    },
    {
      source: 'VAN WETTENS BREAKDOWN SERVICES',
      target: 'invoice_exception_cost',
      value: 41832.28,
    },
    { source: 'PIRTEK PRETORIA (PTY) LTD', target: 'completed', value: 9138.4 },
    {
      source: 'S/C BIDVEST MCCARTHY HINO MIDRAND',
      target: 'completed',
      value: 167727.96,
    },
    {
      source: 'S/C BIDVEST MCCARTHY HINO MIDRAND',
      target: 'accruals',
      value: 2082.1,
    },
    {
      source: 'S/C BIDVEST MCCARTHY HINO MIDRAND',
      target: 'invoice_exception_cost',
      value: 10588.54,
    },
    { source: 'GEARBOXES A-Z CC', target: 'completed', value: 662495.99 },
    { source: 'GEARBOXES A-Z CC', target: 'accruals', value: 32815.0 },
    {
      source: 'GEARBOXES A-Z CC',
      target: 'invoice_exception_cost',
      value: 83235.99,
    },
    {
      source: 'D COMMERCIAL AUTO BODY PTY LTD',
      target: 'completed',
      value: 41484.94,
    },
    { source: 'UD TRUCKS LICHTENBURG', target: 'completed', value: 2852.1 },
    {
      source: 'UD TRUCKS LICHTENBURG',
      target: 'invoice_exception_cost',
      value: 2852.1,
    },
    {
      source: 'VOLVO GROUP SOUTHERN AFRICA',
      target: 'completed',
      value: 70377.67,
    },
    {
      source: 'VOLVO GROUP SOUTHERN AFRICA',
      target: 'accruals',
      value: 4128.76,
    },
    {
      source: 'VOLVO GROUP SOUTHERN AFRICA',
      target: 'invoice_exception_cost',
      value: 4128.76,
    },
    { source: 'BNH AIR BRAKES CC', target: 'completed', value: 2462.0 },
    {
      source: 'BNH AIR BRAKES CC',
      target: 'invoice_exception_cost',
      value: 2462.0,
    },
    { source: 'WEARCHECK', target: 'completed', value: 73244.0 },
    { source: 'WEARCHECK', target: 'invoice_exception_cost', value: 35554.0 },
    {
      source: 'GP REPAIRS AND MAINTENANCE PTY LTD',
      target: 'completed',
      value: 5533885.68,
    },
    {
      source: 'GP REPAIRS AND MAINTENANCE PTY LTD',
      target: 'accruals',
      value: 39102.86,
    },
    {
      source: 'GP REPAIRS AND MAINTENANCE PTY LTD',
      target: 'invoice_exception_cost',
      value: 198740.0,
    },
    { source: 'PECSSER (PTY) LTD', target: 'completed', value: 918.4 },
    {
      source: 'PECSSER (PTY) LTD',
      target: 'invoice_exception_cost',
      value: 918.4,
    },
  ];
  sankeyOptions: any;
  sankeyNodes: any;
  apiSub: any;
  constructor(
    private smallForm: SmallFormService,
    private api: InvoiceStatusService
  ) {}

  ngOnInit() {
    this.callApi(this.smallForm.getFormValues()); //get form values on Init
    this.smallForm.landingPgFormUpdated.subscribe((form) => {
      this.callApi(form);
    });
  }

  callApi(form: smallForm) {
    this.isLoading = true;
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
    this.apiSub = this.api
      .sho002GetInvoiceStatusSankeyV0Sho002GetInvoiceStatusSankeyPost(form)
      .subscribe((response) => {
        this.isLoading = false;
        this.sankeyData = response.data;
        this.sankeyNodes = response.nodes;
        this.generateChart();
      });
  }
  ngOndestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }

  generateChart() {
    const data = {
      nodes: this.nodes,
      links: this.sankeyData,
    };
    this.sankeyOptions = {
      series: {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency',
        },
        data: this.sankeyNodes,
        links: this.sankeyData,
        // nodeGap: 20,
        lineStyle: {
          color: (params: any) => {
            const link = params.data;
            if (link.source === 'completed') return 'blue';
            if (link.source === 'order_exception_cost') return 'orange';
            if (link.source === 'accruals') return 'green';
            if (link.source === 'invoice_exception_cost') return 'red';
            return 'black';
          },
        },
      },
    };
  }
}
