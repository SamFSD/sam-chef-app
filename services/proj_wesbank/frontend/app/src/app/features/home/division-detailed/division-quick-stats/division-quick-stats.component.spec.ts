import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionQuickStatsComponent } from './division-quick-stats.component';

describe('DivisionQuickStatsComponent', () => {
  let component: DivisionQuickStatsComponent;
  let fixture: ComponentFixture<DivisionQuickStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DivisionQuickStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivisionQuickStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
