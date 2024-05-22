import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpkDistCostGraphComponent } from './cpk-dist-cost-graph.component';

describe('CpkDistCostGraphComponent', () => {
  let component: CpkDistCostGraphComponent;
  let fixture: ComponentFixture<CpkDistCostGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpkDistCostGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpkDistCostGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
