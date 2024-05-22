import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpirationsTopRowComponent } from './expirations-top-row.component';

describe('ExpirationsTopRowComponent', () => {
  let component: ExpirationsTopRowComponent;
  let fixture: ComponentFixture<ExpirationsTopRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpirationsTopRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpirationsTopRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
