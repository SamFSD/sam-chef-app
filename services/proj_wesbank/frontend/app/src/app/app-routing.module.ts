import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ComponentDetailsComponent } from './features/home/component-details/component-details.component';
import { SupplierComponentComponent } from './features/home/supplier-component/supplier-component.component';
import { AuthGuard } from '@auth0/auth0-angular';
import { OrdersExceptionsComponent } from './features/home/invoice-status-view/orders-exceptions/orders-exceptions.component';
const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () =>
      import('./features/home/features.module').then(
        (mod) => mod.FeaturesModule
      ),
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
