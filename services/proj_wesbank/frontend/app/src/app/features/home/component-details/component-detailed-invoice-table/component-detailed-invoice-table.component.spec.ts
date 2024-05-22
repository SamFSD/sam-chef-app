import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentDetailedInvoiceTableComponent } from './component-detailed-invoice-table.component';

describe('ComponentDetailedInvoiceTableComponent', () => {
  let component: ComponentDetailedInvoiceTableComponent;
  let fixture: ComponentFixture<ComponentDetailedInvoiceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentDetailedInvoiceTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentDetailedInvoiceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
