import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehContractExpirationsTableComponent } from './veh-contract-expirations-table.component';

describe('VehContractExpirationsTableComponent', () => {
  let component: VehContractExpirationsTableComponent;
  let fixture: ComponentFixture<VehContractExpirationsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehContractExpirationsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehContractExpirationsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
