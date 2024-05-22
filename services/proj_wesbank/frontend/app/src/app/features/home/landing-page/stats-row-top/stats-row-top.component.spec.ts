import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsRowTopComponent } from './stats-row-top.component';

describe('StatsRowTopComponent', () => {
  let component: StatsRowTopComponent;
  let fixture: ComponentFixture<StatsRowTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsRowTopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsRowTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
