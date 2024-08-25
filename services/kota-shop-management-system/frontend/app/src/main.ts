import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAuth0 } from '@auth0/auth0-angular';

bootstrapApplication(AppComponent, {
  providers: [
    // provideAuth0({
    //   domain: 'dev-v0wwscx8d8hz7hj6.us.auth0.com',
    //   clientId: 'o9vPpOTBqPkcDuC6oUAqDgljoBD1WY6P',
    //   authorizationParams: {
    //     redirect_uri: window.location.origin
    //   }
    // })
  ] 
  
}).catch((err) => console.log(err));
