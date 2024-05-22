import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehLicenseExpirationsTableComponent } from './veh-license-expirations-table.component';

describe('VehLicenseExpirationsTableComponent', () => {
  let component: VehLicenseExpirationsTableComponent;
  let fixture: ComponentFixture<VehLicenseExpirationsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehLicenseExpirationsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehLicenseExpirationsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
