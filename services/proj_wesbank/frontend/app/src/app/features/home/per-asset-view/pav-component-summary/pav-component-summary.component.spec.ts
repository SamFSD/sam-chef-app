import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PavComponentSummaryComponent } from './pav-component-summary.component';

describe('PavComponentSummaryComponent', () => {
  let component: PavComponentSummaryComponent;
  let fixture: ComponentFixture<PavComponentSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PavComponentSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PavComponentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
