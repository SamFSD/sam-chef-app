import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphSkeletonComponent } from './graph-skeleton.component';

describe('GraphSkeletonComponent', () => {
  let component: GraphSkeletonComponent;
  let fixture: ComponentFixture<GraphSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphSkeletonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
