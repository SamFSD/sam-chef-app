import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetcardTopRowComponent } from './fleetcard-top-row.component';

describe('FleetcardTopRowComponent', () => {
  let component: FleetcardTopRowComponent;
  let fixture: ComponentFixture<FleetcardTopRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetcardTopRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetcardTopRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
