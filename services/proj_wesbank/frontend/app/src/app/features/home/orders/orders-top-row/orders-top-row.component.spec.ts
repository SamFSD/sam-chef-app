import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersTopRowComponent } from './orders-top-row.component';

describe('OrdersTopRowComponent', () => {
  let component: OrdersTopRowComponent;
  let fixture: ComponentFixture<OrdersTopRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersTopRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersTopRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
