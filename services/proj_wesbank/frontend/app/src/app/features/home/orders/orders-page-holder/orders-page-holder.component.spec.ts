import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersPageHolderComponent } from './orders-page-holder.component';

describe('OrdersPageHolderComponent', () => {
  let component: OrdersPageHolderComponent;
  let fixture: ComponentFixture<OrdersPageHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersPageHolderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersPageHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
