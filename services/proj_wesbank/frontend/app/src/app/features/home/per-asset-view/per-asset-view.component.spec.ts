import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerAssetViewComponent } from './per-asset-view.component';

describe('PerAssetViewComponent', () => {
  let component: PerAssetViewComponent;
  let fixture: ComponentFixture<PerAssetViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerAssetViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerAssetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
