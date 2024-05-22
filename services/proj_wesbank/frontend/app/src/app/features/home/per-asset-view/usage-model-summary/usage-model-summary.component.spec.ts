import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageModelSummaryComponent } from './usage-model-summary.component';

describe('UsageModelSummaryComponent', () => {
  let component: UsageModelSummaryComponent;
  let fixture: ComponentFixture<UsageModelSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsageModelSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageModelSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
