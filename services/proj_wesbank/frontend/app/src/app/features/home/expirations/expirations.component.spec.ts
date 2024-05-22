import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpirationsComponent } from './expirations.component';

describe('ExpirationsComponent', () => {
  let component: ExpirationsComponent;
  let fixture: ComponentFixture<ExpirationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpirationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpirationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
