import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostsPodiumComponent } from './costs-podium.component';

describe('CostsPodiumComponent', () => {
  let component: CostsPodiumComponent;
  let fixture: ComponentFixture<CostsPodiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostsPodiumComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostsPodiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
