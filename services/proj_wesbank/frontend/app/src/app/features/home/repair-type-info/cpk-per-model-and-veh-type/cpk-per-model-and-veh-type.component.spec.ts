import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpkPerModelAndVehTypeComponent } from './cpk-per-model-and-veh-type.component';

describe('CpkPerModelAndVehTypeComponent', () => {
  let component: CpkPerModelAndVehTypeComponent;
  let fixture: ComponentFixture<CpkPerModelAndVehTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpkPerModelAndVehTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpkPerModelAndVehTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
