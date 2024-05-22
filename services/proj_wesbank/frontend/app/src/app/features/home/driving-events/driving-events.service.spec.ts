import { TestBed } from '@angular/core/testing';

import { DrivingEventsService } from './driving-events.service';

describe('DrivingEventsService', () => {
  let service: DrivingEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrivingEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
