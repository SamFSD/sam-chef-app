import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpirationsPopuTableComponent } from './expirations-popu-table.component';

describe('ExpirationsPopuTableComponent', () => {
  let component: ExpirationsPopuTableComponent;
  let fixture: ComponentFixture<ExpirationsPopuTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpirationsPopuTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpirationsPopuTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
