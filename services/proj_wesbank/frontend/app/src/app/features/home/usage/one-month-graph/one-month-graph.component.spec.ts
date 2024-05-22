import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneMonthGraphComponent } from './one-month-graph.component';

describe('OneMonthGraphComponent', () => {
  let component: OneMonthGraphComponent;
  let fixture: ComponentFixture<OneMonthGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneMonthGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneMonthGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
