import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDownloadsComponent } from './report-downloads.component';

describe('ReportDownloadsComponent', () => {
  let component: ReportDownloadsComponent;
  let fixture: ComponentFixture<ReportDownloadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportDownloadsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
