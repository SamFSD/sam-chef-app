import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetCountTableComponent } from './fleet-count-table.component';

describe('FleetCountTableComponent', () => {
  let component: FleetCountTableComponent;
  let fixture: ComponentFixture<FleetCountTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetCountTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetCountTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
