import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SmallFormService } from '../small-form-component/small-form.service';

@Injectable({
  providedIn: 'root'
})
export class DownloaderService {
  private apiURL = environment.API_BASE_PATH
  constructor(
    private http: HttpClient,
    private smallForm: SmallFormService
    ) { }

  downloadLegacyxlsx(date: string, branch: string): Observable<Blob> {
    const data = this.smallForm.getFormValues()
    const url = `${this.apiURL}/v0/dl_orders_file`
    return this.http.post(url, data, {responseType: 'blob'});
  }

  downloadGridFileXlsx(): Observable<Blob> {
    const url = `${this.apiURL}/v0/wesbank_order_file`
    const data = this.smallForm.getFormValues();
    return this.http.post(url, data, {responseType: 'blob'});
  }

  downloadXLS(form: any): Observable<Blob> {
    const url = `${this.apiURL}/v0/accrual_report?from_date=${form}`;
    return this.http.post(url, null, { responseType: 'blob' });
  }
}
