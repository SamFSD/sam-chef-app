export const environment = {
  production: true,
  _API_AUTH_BASE_PATH: 'https://wbapi.fleet-analytics.co.za/*',
  API_BASE_PATH: 'https://wbapi.fleet-analytics.co.za',
  // _ API_AUTH_BASE_PATH: 'https://proj-wesbank-backend-q2sht45vwq-ew.a.run.app/*',
  // API_BASE_PATH: 'https://proj-wesbank-backend-q2sht45vwq-ew.a.run.app',
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
//     domain: 'qrspace.eu.auth0.com',
//     clientId: 'zpRXHfdBFeUdCghk3Y4P5j4TvdVwWWzL',
//     audience: 'https://api.qrs.ltd/',
//     redirectUri: window.location.origin,
//   },
// };
// export const environment = {
//   production: true,
//   QRS_BASE_PATH: 'https://quick-desk-3.web.app',
//   QRS_API_BASE_PATH: 'https://api.qrs.ltd',
//   QRS_API_AUTH_BASE_PATH: 'https://api.qrs.ltd/*',
//   auth: {
//     domain: 'qrspace.eu.auth0.com',
//     clientId: 'zpRXHfdBFeUdCghk3Y4P5j4TvdVwWWzL',
//     audience: 'https://api.qrs.ltd/',
//     redirectUri: window.location.origin,
//   },
// };
