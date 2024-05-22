import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleCountPieComponent } from './vehicle-count-pie.component';

describe('VehicleCountPieComponent', () => {
  let component: VehicleCountPieComponent;
  let fixture: ComponentFixture<VehicleCountPieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleCountPieComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleCountPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
