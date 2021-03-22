# 🦄 SaleFlow App 

## Available Scripts

- `npm start` - run app in development mode
- `npm run build` - build distributables
- `npm run build:serve` - serve distributables on local machine
- `npm run test` - test runner
- `npm run test-watch` - test runner with debug mode enabled
- `npm run coverage` - test with nyc coverage
- `npm run coverage:report` - run coverage and open report on browser
- `npm run lint` - lint the code base
- `npm run eject` - can be done only once. will create a webpack config file and give manual control over the build process of the project

## [Boiler Plate](https://create-react-app.dev/docs)
  Using create react

## [Routing](https://reactrouter.com/web/api/BrowserRouter)  
  Routing config file is `src/routes.ts` and route Components should placed at `src/routes`

## [I18N](https://react.i18next.com)  
  Translation should be placed under `src/i18n`

## [TypeScript](https://www.typescriptlang.org/docs/home.html)
  Declerations of types should go under `src/types`

## [CI/CD](https://docs.github.com/en/actions)

Avilable workflows - 
- Deploy Staging - triggers on push to master will test and deploy to [staging](https://stg-salesflow-digital.web.app)
- Deploy Production - triggers manually will deploy to [production](https://salesflow-digital.web.app)

## [Database](https://www.npmjs.com/package/firebase-tools)

[salesflow-digital db](https://console.firebase.google.com/u/1/project/salesflow-digital)

## [Coverage](https://istanbul.js.org)
Using Istanbul

## Lint
[eslint](https://eslint.org/docs/user-guide/configuring), [prettier](https://prettier.io/docs/en/index.html)

## [Testing](https://jestjs.io/docs/en/getting-started.html)
Using Jest

## [Monitoring](https://sentry.io/organizations/salesflow)
Using Sentry


# Firebase

## Functions
We have a function to alter user data for Auth0 connectivity.
We need to allow IAM API for the google account. 
I did it in https://console.developers.google.com/apis/library/iamcredentials.googleapis.com?authuser=1&project=salesflow-digital

Also, I needed permissions for admin account on Firebase Functions to do
all those stuff. So I created a ServiceAccount on Google console:
https://console.cloud.google.com/iam-admin/serviceaccounts?authuser=1&project=salesflow-digital&supportedpurview=project

You can add/remove roles to add admin capabilities for functions (admin operations).