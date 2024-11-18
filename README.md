# Cognito OIDC Sample Application

This is a sample single-page application (SPA) that can be used with a Amazon Cognito user pool. It is designed to be used with the hosted UI and be compatible with the ODIC/OAuth2 endpoints of the user pool. Since this is a SPA app, PKCE is used to handle the exchange of the authorization code for the ID, Access, and refresh tokens.

This sample application uses session storage to store the returned JWTs. Upon clicking the logout button, the session storage is cleared and the `/logout` endpoint of the user pool is called to clear the 60 min session-cookie for the Cognito managed login.

## Getting started

1. Clone this repo
`git clone https://github.com/iamabrom/cognito-oidc-spa.git`
2. Navigate to the frontEnd directory
`cd /frontEnd`
3. Use the ".envSample" as a template to create your own environment variables
`cp .envSample .env`
4. Update the .env file with the details of your Amazon Cognito user pool
5. Install all dependencies
`npm install`
6. Run the app locally
`npm run dev`
