import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MaterialModule } from 'src/app/material.module';
import { AppRoutingModule } from '../app-routing.module';
import { AuthButtonComponent } from './components/auth-button/auth-button.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LoginButtonComponent } from './components/login-button/login-button.component';
import { LogoutButtonComponent } from './components/logout-button/logout-button.component';
import { NavComponent } from './components/nav/nav.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SignupButtonComponent } from './components/signup-button/signup-button.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    NavComponent,
    AuthButtonComponent,
    ProfileComponent,
    AvatarComponent,
    LoginButtonComponent,
    LogoutButtonComponent,
    SignupButtonComponent,
    LoadingComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
  ],
  exports: [NavComponent,  LoadingComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CoreModule { }
