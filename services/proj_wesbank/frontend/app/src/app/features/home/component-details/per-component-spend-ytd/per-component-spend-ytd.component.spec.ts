import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerComponentSpendYtdComponent } from './per-component-spend-ytd.component';

describe('PerComponentSpendYtdComponent', () => {
  let component: PerComponentSpendYtdComponent;
  let fixture: ComponentFixture<PerComponentSpendYtdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerComponentSpendYtdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerComponentSpendYtdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
