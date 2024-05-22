import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiGuagesComponent } from './bi-guages.component';

describe('BiGuagesComponent', () => {
  let component: BiGuagesComponent;
  let fixture: ComponentFixture<BiGuagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiGuagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiGuagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
