import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleCountComponent } from './vehicle-count.component';

describe('VehicleCountComponent', () => {
  let component: VehicleCountComponent;
  let fixture: ComponentFixture<VehicleCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleCountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
