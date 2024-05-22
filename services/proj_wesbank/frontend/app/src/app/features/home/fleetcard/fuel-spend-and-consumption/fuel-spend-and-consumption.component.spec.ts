import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelSpendAndConsumptionComponent } from './fuel-spend-and-consumption.component';

describe('FuelSpendAndConsumptionComponent', () => {
  let component: FuelSpendAndConsumptionComponent;
  let fixture: ComponentFixture<FuelSpendAndConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FuelSpendAndConsumptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelSpendAndConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
