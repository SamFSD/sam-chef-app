import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchDistPodiumComponent } from './branch-dist-podium.component';

describe('BranchDistPodiumComponent', () => {
  let component: BranchDistPodiumComponent;
  let fixture: ComponentFixture<BranchDistPodiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchDistPodiumComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchDistPodiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
