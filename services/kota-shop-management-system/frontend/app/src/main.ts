import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAuth0 } from '@auth0/auth0-angular';


bootstrapApplication(AppComponent, {
  providers: [


    provideAuth0({
      domain: 'dev-6bycpoidp36735cn.us.auth0.com',
      clientId: 'LnbpgkLJOWhAmt7T8IKVDhm6EjvCGZYp',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    })
  ]
}).catch((err) => console.log(err));
