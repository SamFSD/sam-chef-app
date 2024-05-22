import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetUsageComponent } from './asset-usage.component';

describe('AssetUsageComponent', () => {
  let component: AssetUsageComponent;
  let fixture: ComponentFixture<AssetUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetUsageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
