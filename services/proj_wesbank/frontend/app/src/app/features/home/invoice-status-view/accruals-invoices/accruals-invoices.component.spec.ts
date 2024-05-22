import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccrualsInvoicesComponent } from './accruals-invoices.component';

describe('AccrualsInvoicesComponent', () => {
  let component: AccrualsInvoicesComponent;
  let fixture: ComponentFixture<AccrualsInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccrualsInvoicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccrualsInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
