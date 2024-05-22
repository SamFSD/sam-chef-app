import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalCostsRankerComponent } from './total-costs-ranker.component';

describe('TotalCostsRankerComponent', () => {
  let component: TotalCostsRankerComponent;
  let fixture: ComponentFixture<TotalCostsRankerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalCostsRankerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalCostsRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
