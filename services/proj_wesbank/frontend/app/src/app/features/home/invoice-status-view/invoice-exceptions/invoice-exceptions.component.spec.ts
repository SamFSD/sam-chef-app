import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceExceptionsComponent } from './invoice-exceptions.component';

describe('InvoiceExceptionsComponent', () => {
  let component: InvoiceExceptionsComponent;
  let fixture: ComponentFixture<InvoiceExceptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceExceptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceExceptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
