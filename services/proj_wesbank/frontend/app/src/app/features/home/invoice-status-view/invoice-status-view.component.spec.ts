import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceStatusViewComponent } from './invoice-status-view.component';

describe('InvoiceStatusViewComponent', () => {
  let component: InvoiceStatusViewComponent;
  let fixture: ComponentFixture<InvoiceStatusViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceStatusViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceStatusViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
