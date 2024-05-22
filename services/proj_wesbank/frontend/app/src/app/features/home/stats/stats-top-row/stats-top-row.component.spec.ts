import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsTopRowComponent } from './stats-top-row.component';

describe('StatsTopRowComponent', () => {
  let component: StatsTopRowComponent;
  let fixture: ComponentFixture<StatsTopRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsTopRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsTopRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
