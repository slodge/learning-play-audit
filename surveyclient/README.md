# Learning and Play Audit Survey web application

This project contains the React web application for the LtL survey.
It was created using [Create React App](https://facebook.github.io/create-react-app/docs/getting-started).

## Building

See the [monorepo build and deploy instructions](../README.md)


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

Environment specific builds are available, using environment specific `.env.[ENVIRONMENT]` files (described above). To build, run:
- `npm run build` - for DEV environment
- `npm run build:ltltest` - for TEST environment
- `npm run build:ltllive` - for LIVE environment


Consider deleting the `build` folder before running build as large build folders can cause cdk deployment to fail (in Stuart's painful debugging experience)