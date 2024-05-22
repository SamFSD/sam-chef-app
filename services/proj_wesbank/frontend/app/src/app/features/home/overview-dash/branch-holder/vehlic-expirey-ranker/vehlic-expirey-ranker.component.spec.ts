import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehlicExpireyRankerComponent } from './vehlic-expirey-ranker.component';

describe('VehlicExpireyRankerComponent', () => {
  let component: VehlicExpireyRankerComponent;
  let fixture: ComponentFixture<VehlicExpireyRankerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehlicExpireyRankerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehlicExpireyRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
