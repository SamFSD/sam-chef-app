import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpkPerCatComponent } from './cpk-per-cat.component';

describe('CpkPerCatComponent', () => {
  let component: CpkPerCatComponent;
  let fixture: ComponentFixture<CpkPerCatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpkPerCatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpkPerCatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
