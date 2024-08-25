import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ViewComponent } from './view/view.component';
import { AddComponent } from './add/add.component';



const routes: Routes = [
  { path:'' , component: ListComponent},
  {
    path:'add',
    component:AddComponent
  },
  {
    path:'edit/:id',
    component:AddComponent
  },
  {
    path: 'view/:id',
    component:ViewComponent

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class dashboardRoutingModule { }
