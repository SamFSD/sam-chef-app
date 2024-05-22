import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersExceptionsComponent } from './orders-exceptions.component';

describe('OrdersExceptionsComponent', () => {
  let component: OrdersExceptionsComponent;
  let fixture: ComponentFixture<OrdersExceptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersExceptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersExceptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
