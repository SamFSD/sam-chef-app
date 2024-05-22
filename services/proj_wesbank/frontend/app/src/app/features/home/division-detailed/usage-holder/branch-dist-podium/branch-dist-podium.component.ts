import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-branch-dist-podium',
  templateUrl: './branch-dist-podium.component.html',
  styleUrls: ['./branch-dist-podium.component.scss'],
})
export class BranchDistPodiumComponent {
  @Input() branch!: string;
}
