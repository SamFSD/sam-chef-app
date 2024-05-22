import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutTimerComponent } from './logout-timer.component';

describe('LogoutTimerComponent', () => {
  let component: LogoutTimerComponent;
  let fixture: ComponentFixture<LogoutTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogoutTimerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
