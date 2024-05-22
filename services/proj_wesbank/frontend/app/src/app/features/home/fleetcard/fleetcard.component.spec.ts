import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetcardComponent } from './fleetcard.component';

describe('FleetcardComponent', () => {
  let component: FleetcardComponent;
  let fixture: ComponentFixture<FleetcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetcardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
