import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpkRankerComponent } from './cpk-ranker.component';

describe('CpkRankerComponent', () => {
  let component: CpkRankerComponent;
  let fixture: ComponentFixture<CpkRankerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpkRankerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpkRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
