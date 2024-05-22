import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerAssetHeadingComponent } from './per-asset-heading.component';

describe('PerAssetHeadingComponent', () => {
  let component: PerAssetHeadingComponent;
  let fixture: ComponentFixture<PerAssetHeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerAssetHeadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerAssetHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
