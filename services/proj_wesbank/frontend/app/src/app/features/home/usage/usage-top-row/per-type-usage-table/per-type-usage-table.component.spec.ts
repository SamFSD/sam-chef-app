import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerTypeUsageTableComponent } from './per-type-usage-table.component';

describe('PerTypeUsageTableComponent', () => {
  let component: PerTypeUsageTableComponent;
  let fixture: ComponentFixture<PerTypeUsageTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerTypeUsageTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerTypeUsageTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
