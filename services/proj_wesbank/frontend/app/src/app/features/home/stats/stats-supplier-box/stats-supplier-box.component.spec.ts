import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsSupplierBoxComponent } from './stats-supplier-box.component';

describe('StatsSupplierBoxComponent', () => {
  let component: StatsSupplierBoxComponent;
  let fixture: ComponentFixture<StatsSupplierBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsSupplierBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsSupplierBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
