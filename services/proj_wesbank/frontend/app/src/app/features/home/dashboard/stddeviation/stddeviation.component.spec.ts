import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StddeviationComponent } from './stddeviation.component';

describe('StddeviationComponent', () => {
  let component: StddeviationComponent;
  let fixture: ComponentFixture<StddeviationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StddeviationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StddeviationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
