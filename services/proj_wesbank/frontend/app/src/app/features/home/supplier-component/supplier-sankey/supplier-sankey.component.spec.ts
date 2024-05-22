import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierSankeyComponent } from './supplier-sankey.component';

describe('SupplierSankeyComponent', () => {
  let component: SupplierSankeyComponent;
  let fixture: ComponentFixture<SupplierSankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierSankeyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
