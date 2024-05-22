import { TestBed } from '@angular/core/testing';

import { SmallFormService } from './small-form.service';

describe('SmallFormService', () => {
  let service: SmallFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmallFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
