// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  _API_AUTH_BASE_PATH: 'http://localhost:8000/*',
  API_BASE_PATH: 'http://localhost:8000',
  auth: {
    domain: 'dev-v0wwscx8d8hz7hj6.us.auth0.com',
    clientId: 'o9vPpOTBqPkcDuC6oUAqDgljoBD1WY6P',
    // audience: 'https://api.mfa.vin/',
    redirectUri: 'https://sam2awsbucket.s3-website.eu-north-1.amazonaws.com/',
    // PublicKeyCredential: 'WDLEjqmVvzuUDuZvXczuM3QkyVw6fgwR',
  },
};

// export const environment = {
//   _API_AUTH_BASE_PATH: '/*',
//   API_BASE_PATH: '',
//   auth: {
//     domain: '',
//     clientId: 'WDLEjqmVvzuUDuZvXczuM3QkyVw6fgwR',
//     audience: '/',
//     redirectUri: window.location.origin,
//   },
// };
