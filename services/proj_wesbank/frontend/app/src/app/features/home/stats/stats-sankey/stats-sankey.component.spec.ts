import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsSankeyComponent } from './stats-sankey.component';

describe('StatsSankeyComponent', () => {
  let component: StatsSankeyComponent;
  let fixture: ComponentFixture<StatsSankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsSankeyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
