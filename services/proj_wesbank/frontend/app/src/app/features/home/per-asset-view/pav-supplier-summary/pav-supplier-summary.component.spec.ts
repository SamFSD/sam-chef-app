import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PavSupplierSummaryComponent } from './pav-supplier-summary.component';

describe('PavSupplierSummaryComponent', () => {
  let component: PavSupplierSummaryComponent;
  let fixture: ComponentFixture<PavSupplierSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PavSupplierSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PavSupplierSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
