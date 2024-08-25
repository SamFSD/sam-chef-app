import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Add a check to avoid infinite redirect loops
    if (this.router.url === '/' || this.router.url === '') {
      this.router.navigate(['/login']);
    }
  }
}
