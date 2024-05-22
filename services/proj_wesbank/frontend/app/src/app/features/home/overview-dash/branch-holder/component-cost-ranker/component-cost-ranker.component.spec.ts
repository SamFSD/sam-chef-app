import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentCostRankerComponent } from './component-cost-ranker.component';

describe('ComponentCostRankerComponent', () => {
  let component: ComponentCostRankerComponent;
  let fixture: ComponentFixture<ComponentCostRankerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentCostRankerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentCostRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
