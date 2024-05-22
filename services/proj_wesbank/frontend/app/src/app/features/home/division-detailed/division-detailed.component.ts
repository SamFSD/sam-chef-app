import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FilterFormService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-division-detailed',
  templateUrl: './division-detailed.component.html',
  styleUrls: ['./division-detailed.component.scss'],
})
export class DivisionDetailedComponent {
  searchedDivision: string = 'none';
  divFound: boolean = false;
  branchesInDiv: string[] = [];
  formValues: any;
  pageTitle: string = '';
  branchesPanelOpenState: boolean = false;
  apiSub: any;
  constructor(
    private globalService: GlobalService,
    private route: ActivatedRoute,
    private api: FilterFormService,
    private router: Router
  ) {}
  ngOnInit() {

    this.getDivisionFromForm();
  }
  updatedPageTitle() {
    this.globalService.titleUpdate.next(
      `Division Details:  ${this.searchedDivision}`
    );
  }

  getDivFromParams() {
    this.route.params.subscribe((params: Params) => {
      this.searchedDivision = params['divisionName'].toLowerCase();
      this.globalService.titleUpdate.next(this.pageTitle);

      this.updatedPageTitle();
    });
    return this.getBranches();
  }

  getDivisionFromForm() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }


    this.getBranches();
  }

  getBranches() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
    this.apiSub = this.api
      .getBranchesInDivisionV0GetBranchesInDivisionGet(this.searchedDivision)
      .subscribe((branches) => {
        this.branchesInDiv = branches;
        if (this.branchesInDiv.length > 0) {
          this.divFound = true;
        }
      });
    return this.divFound;
  }

  ngOnDestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }
}
