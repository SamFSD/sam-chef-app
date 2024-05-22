import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentOdoScatterComponent } from './component-odo-scatter.component';

describe('ComponentOdoScatterComponent', () => {
  let component: ComponentOdoScatterComponent;
  let fixture: ComponentFixture<ComponentOdoScatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentOdoScatterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentOdoScatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
