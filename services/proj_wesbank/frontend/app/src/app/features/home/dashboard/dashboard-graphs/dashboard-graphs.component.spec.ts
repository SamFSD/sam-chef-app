import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGraphsComponent } from './dashboard-graphs.component';

describe('DashboardGraphsComponent', () => {
  let component: DashboardGraphsComponent;
  let fixture: ComponentFixture<DashboardGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardGraphsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
