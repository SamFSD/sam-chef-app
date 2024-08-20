export const environment = {
  production: true,
  _API_AUTH_BASE_PATH: 'https://wbapi-dev.fleet-analytics.co.za/*',
  API_BASE_PATH: 'https://wbapi-dev.fleet-analytics.co.za',
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
