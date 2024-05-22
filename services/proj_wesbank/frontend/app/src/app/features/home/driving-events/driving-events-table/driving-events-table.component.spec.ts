import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrivingEventsTableComponent } from './driving-events-table.component';

describe('DrivingEventsTableComponent', () => {
  let component: DrivingEventsTableComponent;
  let fixture: ComponentFixture<DrivingEventsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrivingEventsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrivingEventsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
