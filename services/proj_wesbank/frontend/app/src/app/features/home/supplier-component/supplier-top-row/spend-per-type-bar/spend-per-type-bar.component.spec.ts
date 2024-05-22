import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendPerTypeBarComponent } from './spend-per-type-bar.component';

describe('SpendPerTypeBarComponent', () => {
  let component: SpendPerTypeBarComponent;
  let fixture: ComponentFixture<SpendPerTypeBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpendPerTypeBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendPerTypeBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
