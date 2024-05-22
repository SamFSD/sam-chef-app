import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerBranchComponentTableComponent } from './per-branch-component-table.component';

describe('PerBranchComponentTableComponent', () => {
  let component: PerBranchComponentTableComponent;
  let fixture: ComponentFixture<PerBranchComponentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerBranchComponentTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerBranchComponentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
