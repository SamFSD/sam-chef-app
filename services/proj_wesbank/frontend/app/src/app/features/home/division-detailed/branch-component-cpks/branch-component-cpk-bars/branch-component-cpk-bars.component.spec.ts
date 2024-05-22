import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchComponentCpkBarsComponent } from './branch-component-cpk-bars.component';

describe('BranchComponentCpkBarsComponent', () => {
  let component: BranchComponentCpkBarsComponent;
  let fixture: ComponentFixture<BranchComponentCpkBarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchComponentCpkBarsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchComponentCpkBarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
