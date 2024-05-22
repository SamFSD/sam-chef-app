import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewDashComponent } from './overview-dash.component';

describe('OverviewDashComponent', () => {
  let component: OverviewDashComponent;
  let fixture: ComponentFixture<OverviewDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverviewDashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
