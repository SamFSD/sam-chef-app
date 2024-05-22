import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvgTripDistRankerComponent } from './avg-trip-dist-ranker.component';

describe('AvgTripDistRankerComponent', () => {
  let component: AvgTripDistRankerComponent;
  let fixture: ComponentFixture<AvgTripDistRankerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvgTripDistRankerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvgTripDistRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
