import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTopRowComponent } from './dashboard-top-row.component';

describe('DashboardTopRowComponent', () => {
  let component: DashboardTopRowComponent;
  let fixture: ComponentFixture<DashboardTopRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardTopRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTopRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
