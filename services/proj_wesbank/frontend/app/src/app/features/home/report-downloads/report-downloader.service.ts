import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportDownloaderService {
  private apiURL = environment.API_BASE_PATH;
  constructor(private http: HttpClient) {}

  // getMonthlyOrderReport(formValues:any): Observable<Blob> {
  //   // const encodedBranch = encodeURIComponent(branch);
  //   const url = `${this.apiURL}/v0/dl_orders_file?date=${date}&branch=${encodedBranch}`
  //   return this.http.get(url, {responseType: 'blob'});
  // }

  drivingEventsReport(formValues: any) {
    // driving events report : WIP
    // 2 PAGE
    return this.http.post(
      `${this.apiURL}/v0/get_driving_events_report`,
      formValues,
      { responseType: 'blob' }
    );
  }

  monthlyReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/get_monthly_orders_report`,
      formValues,
      { responseType: 'blob' }
    );
  }
  detailedUsageReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/sho002_get_usage_summary`,
      formValues,
      { responseType: 'blob' }
    );
  }
  supplierComponentReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/get_per_supplier_or_component_report`,
      formValues,
      { responseType: 'blob' }
    );
  }

  usageSummaryReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/sho002_get_usage_summary`,
      formValues,
      { responseType: 'blob' }
    );
  }

  fleetlistReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/sho002_get_fleetlist_report`,
      formValues,
      { responseType: 'blob' }
    );
  }

  odoBandPerComponentReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/odo_band_per_component_report`,
      formValues,
      { responseType: 'blob' }
    );
  }
  tripDataReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/sho002_get_report_trip_data_per_month'`,
      formValues,
      { responseType: 'blob' }
    );
  }

  monthlyVehicleReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/sho002_get_monthly_vehicles_report`,
      formValues,
      { responseType: 'blob' }
    );
  }

  assetsDetailsReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/sho002_get_report_asset_invoices_per_month`,
      formValues,
      { responseType: 'blob' }
    );
  }

  externalFleetlistReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/external_fleetlist_report`,
      formValues,
      { responseType: 'blob' }
    );
  }
  shopriteCheckersReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/V0/shoprite_checkers_rebills_report`,
      formValues,
      { responseType: 'blob' }
    );
  }
  contractUsageTwelveMonthReport(formValues: any) {
    return this.http.post(
      `${this.apiURL}/v0/contract_usage_twelve_month`,
      formValues,
      { responseType: 'blob' }
    );
  }

  downtimeReport(formValues: any) {
    return this.http.post(`${this.apiURL}/v0/downtime_report`, formValues, {
      responseType: 'blob',
    });
  }

  fleetcardReport(formValues: any) {
    return this.http.post(`${this.apiURL}/v0/fleetcard_report`, formValues, {
      responseType: 'blob',
    });
  }

  usersLogsReport(formValues: any) {
    return this.http.post(`${this.apiURL}/v0/get_last_loggin_report_v0_get_last_logged_users_logs_post`, formValues, {
      responseType: 'blob',
    });
  }
  // REPORT TO CREATE FOR THE BACKEND
  // monthly vehicle reports
  //trip data report
}