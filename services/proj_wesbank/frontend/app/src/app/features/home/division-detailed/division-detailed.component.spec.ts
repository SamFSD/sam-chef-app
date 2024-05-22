import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionDetailedComponent } from './division-detailed.component';

describe('DivisionDetailedComponent', () => {
  let component: DivisionDetailedComponent;
  let fixture: ComponentFixture<DivisionDetailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DivisionDetailedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivisionDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
