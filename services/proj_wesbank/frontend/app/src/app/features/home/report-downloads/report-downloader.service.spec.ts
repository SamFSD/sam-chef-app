import { TestBed } from '@angular/core/testing';

import { ReportDownloaderService } from './report-downloader.service';

describe('ReportDownloaderService', () => {
  let service: ReportDownloaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportDownloaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
