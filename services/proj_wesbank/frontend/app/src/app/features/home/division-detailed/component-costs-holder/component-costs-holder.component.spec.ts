import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentCostsHolderComponent } from './component-costs-holder.component';

describe('ComponentCostsHolderComponent', () => {
  let component: ComponentCostsHolderComponent;
  let fixture: ComponentFixture<ComponentCostsHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentCostsHolderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentCostsHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
