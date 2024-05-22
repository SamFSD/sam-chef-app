import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentCostPerVehTypeGraphComponent } from './component-cost-per-veh-type-graph.component';

describe('ComponentCostPerVehTypeGraphComponent', () => {
  let component: ComponentCostPerVehTypeGraphComponent;
  let fixture: ComponentFixture<ComponentCostPerVehTypeGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentCostPerVehTypeGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentCostPerVehTypeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
