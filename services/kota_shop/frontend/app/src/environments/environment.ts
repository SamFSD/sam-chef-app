// environment.ts

// Common configuration
const commonAuth = {
  domain: 'dev-v0wwscx8d8hz7hj6.us.auth0.com',
  clientId: 'o9vPpOTBqPkcDuC6oUAqDgljoBD1WY6P',
  audience: 'https://dev-v0wwscx8d8hz7hj6.us.auth0.com/api/v2/'
};

// Environment-specific configuration
const environmentConfig = {
  production: {
    production: true,
    _API_AUTH_BASE_PATH: 'http://localhost:8080/api',
    API_BASE_PATH: 'http://localhost:8080/api',
    auth: {
      ...commonAuth,
      redirectUri: 'http://sam2awsbucket.s3-website.eu-north-1.amazonaws.com/'
    }
  },
  local: {
    production: false,
    _API_AUTH_BASE_PATH: 'http://localhost:8080/api',
    API_BASE_PATH: 'http://localhost:8080/api',
    auth: {
      ...commonAuth,
      redirectUri: 'http://localhost:4200/'
    }
  }
};

// Determine the current environment
const isProduction = false; // Set this flag based on your build configuration or environment

// Export the appropriate configuration
export const environment = isProduction ? environmentConfig.production : environmentConfig.local;
