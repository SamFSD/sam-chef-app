import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelSpendPerMonthGraphComponent } from './fuel-spend-per-month-graph.component';

describe('FuelSpendPerMonthGraphComponent', () => {
  let component: FuelSpendPerMonthGraphComponent;
  let fixture: ComponentFixture<FuelSpendPerMonthGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FuelSpendPerMonthGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelSpendPerMonthGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
