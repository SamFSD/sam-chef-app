import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerAssetUsageTableComponent } from './per-asset-usage-table.component';

describe('PerAssetUsageTableComponent', () => {
  let component: PerAssetUsageTableComponent;
  let fixture: ComponentFixture<PerAssetUsageTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerAssetUsageTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerAssetUsageTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
