import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsComponentBoxComponent } from './stats-component-box.component';

describe('StatsComponentBoxComponent', () => {
  let component: StatsComponentBoxComponent;
  let fixture: ComponentFixture<StatsComponentBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsComponentBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsComponentBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
