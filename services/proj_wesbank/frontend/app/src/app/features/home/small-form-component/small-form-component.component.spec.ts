import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallFormComponentComponent } from './small-form-component.component';

describe('SmallFormComponentComponent', () => {
  let component: SmallFormComponentComponent;
  let fixture: ComponentFixture<SmallFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmallFormComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmallFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
