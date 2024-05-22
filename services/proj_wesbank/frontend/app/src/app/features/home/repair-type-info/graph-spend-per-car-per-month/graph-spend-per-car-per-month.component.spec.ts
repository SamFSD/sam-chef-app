import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphSpendPerCarPerMonthComponent } from './graph-spend-per-car-per-month.component';

describe('GraphSpendPerCarPerMonthComponent', () => {
  let component: GraphSpendPerCarPerMonthComponent;
  let fixture: ComponentFixture<GraphSpendPerCarPerMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphSpendPerCarPerMonthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphSpendPerCarPerMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
