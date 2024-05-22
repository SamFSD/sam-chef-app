import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpkModelRankerComponent } from './cpk-model-ranker.component';

describe('CpkModelRankerComponent', () => {
  let component: CpkModelRankerComponent;
  let fixture: ComponentFixture<CpkModelRankerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpkModelRankerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpkModelRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
