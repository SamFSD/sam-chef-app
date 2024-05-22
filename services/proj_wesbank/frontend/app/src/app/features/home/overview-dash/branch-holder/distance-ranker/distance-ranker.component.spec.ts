import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistanceRankerComponent } from './distance-ranker.component';

describe('DistanceRankerComponent', () => {
  let component: DistanceRankerComponent;
  let fixture: ComponentFixture<DistanceRankerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DistanceRankerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistanceRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
