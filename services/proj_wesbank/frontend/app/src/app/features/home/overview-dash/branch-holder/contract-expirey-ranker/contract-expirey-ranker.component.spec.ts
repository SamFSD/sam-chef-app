import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractExpireyRankerComponent } from './contract-expirey-ranker.component';

describe('ContractExpireyRankerComponent', () => {
  let component: ContractExpireyRankerComponent;
  let fixture: ComponentFixture<ContractExpireyRankerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractExpireyRankerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractExpireyRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
