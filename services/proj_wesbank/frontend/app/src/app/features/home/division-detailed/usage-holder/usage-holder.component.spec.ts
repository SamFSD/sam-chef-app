import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageHolderComponent } from './usage-holder.component';

describe('UsageHolderComponent', () => {
  let component: UsageHolderComponent;
  let fixture: ComponentFixture<UsageHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsageHolderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
