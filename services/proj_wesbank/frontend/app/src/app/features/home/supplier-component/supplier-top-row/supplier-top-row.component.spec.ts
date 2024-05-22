import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierTopRowComponent } from './supplier-top-row.component';

describe('SupplierTopRowComponent', () => {
  let component: SupplierTopRowComponent;
  let fixture: ComponentFixture<SupplierTopRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierTopRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierTopRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
