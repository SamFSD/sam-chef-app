import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchHolderComponent } from './branch-holder.component';

describe('BranchHolderComponent', () => {
  let component: BranchHolderComponent;
  let fixture: ComponentFixture<BranchHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchHolderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
