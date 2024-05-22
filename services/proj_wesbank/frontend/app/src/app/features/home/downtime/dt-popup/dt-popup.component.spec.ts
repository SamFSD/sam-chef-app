import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DtPopupComponent } from './dt-popup.component';

describe('DtPopupComponent', () => {
  let component: DtPopupComponent;
  let fixture: ComponentFixture<DtPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DtPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DtPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
