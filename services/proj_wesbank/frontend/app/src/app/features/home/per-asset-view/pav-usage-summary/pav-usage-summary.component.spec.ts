import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PavUsageSummaryComponent } from './pav-usage-summary.component';

describe('PavUsageSummaryComponent', () => {
  let component: PavUsageSummaryComponent;
  let fixture: ComponentFixture<PavUsageSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PavUsageSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PavUsageSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
