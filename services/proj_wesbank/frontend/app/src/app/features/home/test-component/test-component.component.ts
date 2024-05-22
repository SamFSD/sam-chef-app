import { Component, OnInit } from '@angular/core';
import { SmallFormService } from '../small-form-component/small-form.service';

interface Division {
  name: string;
  branches: Branch[];
}

interface Branch {
  name: string;
}

@Component({
  selector: 'app-test-component',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.scss'],
})
export class TestComponentComponent implements OnInit {
  // divisions: any;
  constructor(public smallForm: SmallFormService) {
  }
  divisions = this.smallForm.allowedDivs;

  // allowedDivs = ['div1', 'div2', 'div3'];
  allowedBranches: Branch[] = [];

  fullFleetChecked = true;
  divChecked: { [key: string]: boolean } = {};

  ngOnInit() {
    this.smallForm.reportToDownload$
      // .pipe(takeUntil(this.onDestroy))
      .subscribe((reportType: string) => {
        // this.callDownloadApi(reportType);
      });
    this.smallForm.initialiseForm().subscribe();
    console.log(this.smallForm.allowedDivs);
    this.fullFleetChecked = true;
    this.updateAllowedBranches(); // Initialize allowedBranches
  }

  onFullFleetChange(event: any) {
    this.fullFleetChecked = event.checked;
    if (this.fullFleetChecked) {
      this.divChecked = {}; // Uncheck all divisions
      this.updateAllowedBranches(); // Update allowedBranches based on division selections
    } else {
      this.allowedBranches = [];
    }
  }

  onDivisionChange(div: string, event: any) {
    this.divChecked[div] = event.target.checked;
    if (this.divChecked[div]) {
      this.fullFleetChecked = false; // Uncheck Full Fleet if any division is checked
    }
    this.updateAllowedBranches(); // Update allowedBranches based on division selections
  }

  private updateAllowedBranches() {
    this.allowedBranches = [];
    if (this.fullFleetChecked) {
      this.smallForm.allowedDivs.forEach((division: any) => {
        this.allowedBranches.push(...division.branches);
      });
    } else {
      this.divisions.forEach((divName: any) => {
        if (this.divChecked[divName]) {
          const division = this.smallForm.allowedDivs.find((d: any) => d.division === divName);
          if (division) {
            this.allowedBranches.push(...division.branches);
          }
        }
      });
    }
  }
}
