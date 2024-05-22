import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierBarComponent } from './supplier-bar.component';

describe('SupplierBarComponent', () => {
  let component: SupplierBarComponent;
  let fixture: ComponentFixture<SupplierBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
