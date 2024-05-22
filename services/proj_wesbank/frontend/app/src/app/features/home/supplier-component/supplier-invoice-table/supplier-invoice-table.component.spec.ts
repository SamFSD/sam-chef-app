import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierInvoiceTableComponent } from './supplier-invoice-table.component';

describe('SupplierInvoiceTableComponent', () => {
  let component: SupplierInvoiceTableComponent;
  let fixture: ComponentFixture<SupplierInvoiceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierInvoiceTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierInvoiceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
