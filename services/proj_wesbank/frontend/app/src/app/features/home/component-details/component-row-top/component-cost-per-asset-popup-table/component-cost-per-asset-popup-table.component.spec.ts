import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentCostPerAssetPopupTableComponent } from './component-cost-per-asset-popup-table.component';

describe('ComponentCostPerAssetPopupTableComponent', () => {
  let component: ComponentCostPerAssetPopupTableComponent;
  let fixture: ComponentFixture<ComponentCostPerAssetPopupTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentCostPerAssetPopupTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentCostPerAssetPopupTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
