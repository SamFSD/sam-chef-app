import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentCostPerSupplierGraphComponent } from './component-cost-per-supplier-graph.component';

describe('ComponentCostPerSupplierGraphComponent', () => {
  let component: ComponentCostPerSupplierGraphComponent;
  let fixture: ComponentFixture<ComponentCostPerSupplierGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentCostPerSupplierGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentCostPerSupplierGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
