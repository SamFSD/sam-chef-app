import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPermissionDisplayComponent } from './user-permission-display.component';

describe('UserPermissionDisplayComponent', () => {
  let component: UserPermissionDisplayComponent;
  let fixture: ComponentFixture<UserPermissionDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserPermissionDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPermissionDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
