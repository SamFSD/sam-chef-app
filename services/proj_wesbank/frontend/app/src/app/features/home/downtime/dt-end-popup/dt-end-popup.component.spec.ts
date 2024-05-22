import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DtEndPopupComponent } from './dt-end-popup.component';

describe('DtEndPopupComponent', () => {
  let component: DtEndPopupComponent;
  let fixture: ComponentFixture<DtEndPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DtEndPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DtEndPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
