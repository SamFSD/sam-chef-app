import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchComponentCpksComponent } from './branch-component-cpks.component';

describe('BranchComponentCpksComponent', () => {
  let component: BranchComponentCpksComponent;
  let fixture: ComponentFixture<BranchComponentCpksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchComponentCpksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchComponentCpksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
