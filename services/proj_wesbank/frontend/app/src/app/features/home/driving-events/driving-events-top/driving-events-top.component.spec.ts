import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrivingEventsTopComponent } from './driving-events-top.component';

describe('DrivingEventsTopComponent', () => {
  let component: DrivingEventsTopComponent;
  let fixture: ComponentFixture<DrivingEventsTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrivingEventsTopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrivingEventsTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
