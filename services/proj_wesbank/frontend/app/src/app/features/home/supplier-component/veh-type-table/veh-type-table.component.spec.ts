import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehTypeTableComponent } from './veh-type-table.component';

describe('VehTypeTableComponent', () => {
  let component: VehTypeTableComponent;
  let fixture: ComponentFixture<VehTypeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehTypeTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehTypeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
