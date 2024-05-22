import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTimeGraphComponent } from './all-time-graph.component';

describe('AllTimeGraphComponent', () => {
  let component: AllTimeGraphComponent;
  let fixture: ComponentFixture<AllTimeGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllTimeGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllTimeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
