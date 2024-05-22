import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentRowTopComponent } from './component-row-top.component';

describe('ComponentRowTopComponent', () => {
  let component: ComponentRowTopComponent;
  let fixture: ComponentFixture<ComponentRowTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentRowTopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentRowTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
