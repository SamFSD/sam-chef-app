// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  _API_AUTH_BASE_PATH: 'http://localhost:3000/*',
  API_BASE_PATH: 'http://localhost:3000',
  auth: {
    domain: '',
    clientId: '',
    audience: '',
    redirectUri: window.location.origin,
    PublicKeyCredential: '',
  },
};

