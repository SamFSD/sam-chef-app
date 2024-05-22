import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairTypeInfoComponent } from './repair-type-info.component';

describe('RepairTypeInfoComponent', () => {
  let component: RepairTypeInfoComponent;
  let fixture: ComponentFixture<RepairTypeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepairTypeInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepairTypeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
