import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompCpkYtdGraphComponent } from './comp-cpk-ytd-graph.component';

describe('CompCpkYtdGraphComponent', () => {
  let component: CompCpkYtdGraphComponent;
  let fixture: ComponentFixture<CompCpkYtdGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompCpkYtdGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompCpkYtdGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
