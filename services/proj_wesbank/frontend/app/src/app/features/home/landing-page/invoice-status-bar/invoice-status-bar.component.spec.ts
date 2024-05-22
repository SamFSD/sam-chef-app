import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceStatusBarComponent } from './invoice-status-bar.component';

describe('InvoiceStatusBar', () => {
  let component: InvoiceStatusBarComponent;
  let fixture: ComponentFixture<InvoiceStatusBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceStatusBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceStatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
