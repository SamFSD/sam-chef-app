import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairTypeTopComponent } from './repair-type-top.component';

describe('RepairTypeTopComponent', () => {
  let component: RepairTypeTopComponent;
  let fixture: ComponentFixture<RepairTypeTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepairTypeTopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepairTypeTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
