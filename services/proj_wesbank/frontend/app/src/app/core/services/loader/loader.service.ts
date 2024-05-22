import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  hideLoader() {
    throw new Error('Method not implemented.');
  }
  showLoader() {
    throw new Error('Method not implemented.');
  }

  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }
}
