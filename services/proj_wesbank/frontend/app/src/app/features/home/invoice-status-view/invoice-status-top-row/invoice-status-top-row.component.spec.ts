import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceStatusTopRowComponent } from './invoice-status-top-row.component';

describe('InvoiceStatusTopRowComponent', () => {
  let component: InvoiceStatusTopRowComponent;
  let fixture: ComponentFixture<InvoiceStatusTopRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceStatusTopRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceStatusTopRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
