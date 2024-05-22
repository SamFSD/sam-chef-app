import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceStatusSankeyComponent } from './invoice-status-sankey.component';

describe('InvoiceStatusSankeyComponent', () => {
  let component: InvoiceStatusSankeyComponent;
  let fixture: ComponentFixture<InvoiceStatusSankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceStatusSankeyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceStatusSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
