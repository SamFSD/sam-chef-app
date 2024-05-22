import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriversEventsMapsComponent } from './drivers-events-maps.component';

describe('DriversEventsMapsComponent', () => {
  let component: DriversEventsMapsComponent;
  let fixture: ComponentFixture<DriversEventsMapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriversEventsMapsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriversEventsMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
