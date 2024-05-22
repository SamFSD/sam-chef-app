import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashStddevPopupComponent } from './dash-stddev-popup.component';

describe('DashStddevPopupComponent', () => {
  let component: DashStddevPopupComponent;
  let fixture: ComponentFixture<DashStddevPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashStddevPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashStddevPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
