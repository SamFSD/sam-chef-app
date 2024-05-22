import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PavTopRowComponent } from './pav-top-row.component';

describe('PavTopRowComponent', () => {
  let component: PavTopRowComponent;
  let fixture: ComponentFixture<PavTopRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PavTopRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PavTopRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
