// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  _API_AUTH_BASE_PATH: 'http://localhost:8000/*',
  API_BASE_PATH: 'http://localhost:8000',
  auth: {
    domain: 'fleet-analytics.eu.auth0.com',
    clientId: 'RWP0zFUGWTkvvkgu8AHvPQ3nSoAGUcWr',
    audience: 'https://api.mfa.vin/',
    redirectUri: window.location.origin,
    PublicKeyCredential: 'WDLEjqmVvzuUDuZvXczuM3QkyVw6fgwR',
  },
};

// export const environment = {
//   _API_AUTH_BASE_PATH: 'https://proj-wesbank-backend-q2sht45vwq-ew.a.run.app/*',
//   API_BASE_PATH: 'https://proj-wesbank-backend-q2sht45vwq-ew.a.run.app',
//   auth: {
//     domain: 'fleet-analytics.eu.auth0.com',
//     clientId: 'WDLEjqmVvzuUDuZvXczuM3QkyVw6fgwR',
//     audience: 'https://proj-wesbank-backend-q2sht45vwq-ew.a.run.app/',
//     redirectUri: window.location.origin,
//   },
// };
