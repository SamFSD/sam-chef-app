import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsInfoPopupComponent } from './stats-info-popup.component';

describe('StatsInfoPopupComponent', () => {
  let component: StatsInfoPopupComponent;
  let fixture: ComponentFixture<StatsInfoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsInfoPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsInfoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
