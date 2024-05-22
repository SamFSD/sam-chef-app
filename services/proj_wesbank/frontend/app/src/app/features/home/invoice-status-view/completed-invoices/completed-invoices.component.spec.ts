import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedInvoicesComponent } from './completed-invoices.component';

describe('CompletedInvoicesComponent', () => {
  let component: CompletedInvoicesComponent;
  let fixture: ComponentFixture<CompletedInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletedInvoicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompletedInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
