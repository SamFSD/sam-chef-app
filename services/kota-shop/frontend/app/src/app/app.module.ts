import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from '@auth0/auth0-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from 'src/environments/environment';
import { CoreModule } from './core/core.module';
import { MaterialModule } from './material.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { AppGlobalService } from './app-global.service';
import { GlobalService } from './core/services/global.service';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { AuthInterceptor } from './core/services/auth-interceptor.service';
import { TabulatorModule } from './tabulator.module';


@NgModule({
  declarations: [AppComponent, ],
  imports: [
    CommonModule,
    BrowserModule,
    TabulatorModule,
    MatSidenavModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialModule,
    MatTooltipModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    AuthModule.forRoot({
      ...environment.auth,
      httpInterceptor: {
        allowedList: [`${environment._API_AUTH_BASE_PATH}`],
      },
    }),
    BrowserAnimationsModule,
    CoreModule,
    AgGridModule,
  ],
  providers: [
  
    GlobalService,
    AppGlobalService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
