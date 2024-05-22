import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelCpkAndConsuptionsComponent } from './fuel-cpk-and-consuptions.component';

describe('FuelCpkAndConsuptionsComponent', () => {
  let component: FuelCpkAndConsuptionsComponent;
  let fixture: ComponentFixture<FuelCpkAndConsuptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FuelCpkAndConsuptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelCpkAndConsuptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
