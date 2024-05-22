import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageTopRowComponent } from './usage-top-row.component';

describe('UsageTopRowComponent', () => {
  let component: UsageTopRowComponent;
  let fixture: ComponentFixture<UsageTopRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsageTopRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageTopRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
