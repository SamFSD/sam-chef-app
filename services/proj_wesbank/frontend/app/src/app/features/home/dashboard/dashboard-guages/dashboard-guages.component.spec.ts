import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGuagesComponent } from './dashboard-guages.component';

describe('DashboardGuagesComponent', () => {
  let component: DashboardGuagesComponent;
  let fixture: ComponentFixture<DashboardGuagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardGuagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGuagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
