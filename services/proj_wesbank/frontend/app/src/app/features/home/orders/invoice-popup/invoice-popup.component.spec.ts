import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePopupComponent } from './invoice-popup.component';

describe('InvoicePopupComponent', () => {
  let component: InvoicePopupComponent;
  let fixture: ComponentFixture<InvoicePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
