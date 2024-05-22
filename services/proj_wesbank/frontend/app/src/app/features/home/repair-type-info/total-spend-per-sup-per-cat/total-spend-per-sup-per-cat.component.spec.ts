import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSpendPerSupPerCatComponent } from './total-spend-per-sup-per-cat.component';

describe('TotalSpendPerSupPerCatComponent', () => {
  let component: TotalSpendPerSupPerCatComponent;
  let fixture: ComponentFixture<TotalSpendPerSupPerCatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalSpendPerSupPerCatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalSpendPerSupPerCatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
