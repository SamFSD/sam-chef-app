import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingExpirationsComponent } from './upcoming-expirations.component';

describe('UpcomingExpirationsComponent', () => {
  let component: UpcomingExpirationsComponent;
  let fixture: ComponentFixture<UpcomingExpirationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingExpirationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingExpirationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
