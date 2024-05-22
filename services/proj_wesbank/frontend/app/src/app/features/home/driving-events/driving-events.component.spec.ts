import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrivingEventsComponent } from './driving-events.component';

describe('DrivingEventsComponent', () => {
  let component: DrivingEventsComponent;
  let fixture: ComponentFixture<DrivingEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrivingEventsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrivingEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
