import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpendPerSupCategoryComponent } from './spend-per-sup-category.component';

describe('SpendPerSupCategoryComponent', () => {
  let component: SpendPerSupCategoryComponent;
  let fixture: ComponentFixture<SpendPerSupCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpendPerSupCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpendPerSupCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
