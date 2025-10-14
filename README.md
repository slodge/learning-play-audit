# Learning through Landscapes Trust - Learning and Play Audit Survey

This monorepo contains the following projects:

- [cdk-stacks](cdk-stacks) - AWS CDK project to build required AWS components and deploy web applications.
- [surveyclient](surveyclient) - React (PWA) web application for completing the LtL audit surveys.
- [adminclient](adminclient) - React web application for review and retrieval of LtL audit survey responses.
- [sharedcode](sharedcode) - content common to surveyclient and adminclient - the survey questions and description.

Built by [Scottish Tech Army](https://www.scottishtecharmy.org/) volunteers.

This project is property of [Learning through Landscapes Trust](https://www.ltl.org.uk/). The project code is Open Source
licensed as described below, while the survey content (i.e. the questions and descriptions within the
survey) are Copyright 2020 Learning through Landscapes Trust.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this project except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## Building and deploying

To build the components of the application and deploy to AWS, follow these instructions after cloning the repo. The instructions are environment specific. In the instructions below, the environment being created is `dev`. Other options are `test` and `live`.

### Prerequisites

The following tools are needed in the build and deploy process, install them first

- Register or use an existing AWS account with [CLI access keys](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html).
- Install [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)
- Install the [AWS CDK](https://docs.aws.amazon.com/cdk/index.html), described here: https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_install
- Install and start [Docker](https://www.docker.com/get-started) to build the Lambda functions
- The backend components require Node v22 to build - as the Lambda runtime environment is Node v22 and there are some prebuilt dependencies

### Build and deploy the backend components

In the following, `PROJECT_ROOT` is the directory where you have cloned the repo.

#### Install dependencies for node projects

**Warning:** To get these projects to `npm install` or to get the backend to deploy, you might need to `npm install`, `npm run build` and `npm pack` versions of the front end projects first. This is because the these back end lock files and deployments pull-in the built and packaged code from the front end. This is a little weird - as the front end can't really be packaged until the back end has been deployed (because aws paths are needed!)... so you need to go back and rebuild and repack them after back end deployment... This build loop could do with being improved a little (but not an urgent thing!). 

```
cd PROJECT_ROOT/cdk-stacks; npm install
cd resources/addSurveyLambda; npm install
cd ../confirmSurveyLambda; npm install
cd ../emailSurveyLambda; npm install
```

#### Deploy backend

If it's the first time CDK use in an environment, the environment needs to be [prepared](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) for the deployment. Run the following first

```
cdk bootstrap aws://AWS_ACCOUNT_NUMBER/REGION --profile AWS_PROFILE --context env=dev --context nameprefix=PREFIX --context surveyEmailBcc=EMAIL_ADDRESS --context surveyEmailFrom=EMAIL_ADDRESS
```
Here `aws://AWS_ACCOUNT_NUMBER/REGION` is the AWS account and region to use for the deployment, e.g. `aws://1234567890/eu-west-2`.

Once that's done, the rest of the deploy should go smoothly


```
cd PROJECT_ROOT/cdk-stacks
cdk deploy PREFIX-Backend-dev --profile AWS_PROFILE --context env=dev --context nameprefix=PREFIX --context surveyEmailBcc=EMAIL_ADDRESS --context surveyEmailFrom=EMAIL_ADDRESS
```

Here `PREFIX` is the resource prefix for your deployment, e.g. '`MySurvey`'. This needs to be unique to your deployment as it is used for resource name generation and S3 resource names must be unique within their AWS region.
Use `--profile AWS_PROFILE` if necessary to choose the correct [AWS CLI access keys](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html).

Example as executed by Stuart in his account:

```
cdk bootstrap aws://983641940485/eu-west-1 --profile slodge-Admin --context env=dev --context nameprefix=TESTING --context surveyEmailBcc=lodge.stuart@gmail.com --context surveyEmailFrom=lodge.stuart@gmail.com

cdk deploy TESTING-Backend-dev --profile slodge-Admin --context env=dev --context nameprefix=TESTING --context surveyEmailBcc=lodge.stuart@gmail.com --context surveyEmailFrom=lodge.stuart@gmail.com
```

The CDK will create and deploy a CloudFormation stack of the backend AWS components. If it completes successfully, it will return output like:

```
 ✅  PREFIX-Backend-dev

Outputs:
PREFIX-Backend-dev.LTLclientAPIendpoint = https://0000000000.execute-api.eu-west-2.amazonaws.com/prod/
PREFIX-Backend-dev.SurveyClientApiEndpointEBB28C68 = https://0000000000.execute-api.eu-west-2.amazonaws.com/prod/
PREFIX-Backend-dev.SurveyResourcesbucket = PREFIX-dev-surveyresources
PREFIX-Backend-dev.SurveyResponseSummariesindex = SummaryIndex
PREFIX-Backend-dev.SurveyResponsestable = PREFIX-dev-SurveyResponses
PREFIX-Backend-dev.Surveyadminidentitypoolid = eu-west-2:00000000-0000-0000-0000-000000000000
PREFIX-Backend-dev.Surveyadminuserpoolid = eu-west-2_000000000
PREFIX-Backend-dev.Surveyadminuserpoolwebclientid = 00000000000000000000000000
PREFIX-Backend-dev.Surveyuserpoolid = eu-west-2_000000000
PREFIX-Backend-dev.Surveyuserpoolwebclientid = 00000000000000000000000000

Stack ARN:
arn:aws:cloudformation:eu-west-2:ACCOUNT_NUMBER:stack/PREFIX-Backend-dev/00000000-0000-0000-0000-000000000000
```

These outputs are also shown in the outputs section of the CloudformationStack in the AWS Console. They are used to populate the environment specific parameters in the build of the frontend clients below.

Note - there currently appears to be a bug in CDK/CloudFormation cognito pool deployments with MFA set to required. If the error message `SMS configuration and Auto verification for phone_number are required when MFA is required/optional` appears, then
- Manually remove the remaining created resources
- Comment out the following section from the `adminClientUserPool` declaration in `cdk-backend-stack.js`:
```
        mfa: cognito.Mfa.REQUIRED,
        mfaSecondFactor: {
          sms: false,
          otp: true,
        },
```
- Redeploy the backend stack - it should succeed this time
- Execute the following AWS API command to manually set up MFA
```
aws cognito-idp set-user-pool-mfa-config --profile [aws profile] --user-pool-id [created admin user pool id] --software-token-mfa-configuration Enabled=true --mfa-configuration ON
```
- Uncomment the commented out code above - future deployments to the same stack should work

### Build the frontend components

#### Configure environment specific settings

Copy `PROJECT_ROOT/adminclient/.env` to `PROJECT_ROOT/adminclient/.env.local` and fill in the AWS backend parameters (from the outputs above):

```
# AWS configuration

REACT_APP_DEPLOY_ENVIRONMENT=DEV

# Authentication
REACT_APP_AWS_REGION=eu-west-2
REACT_APP_AWS_IDENTITY_POOL_ID=[PREFIX-Backend-dev.Surveyadminidentitypoolid]
REACT_APP_AWS_USER_POOL_ID=[PREFIX-Backend-dev.Surveyadminuserpoolid]
REACT_APP_AWS_USER_POOL_WEB_CLIENT_ID=[PREFIX-Backend-dev.Surveyadminuserpoolwebclientid]

# Photo Storage
REACT_APP_AWS_SURVEY_RESOURCES_S3_BUCKET=[PREFIX-Backend-dev.SurveyResourcesbucket]

# Dynamo DB Table
REACT_APP_AWS_SURVEY_RESPONSES_TABLE=[PREFIX-Backend-dev.SurveyResponsestable]
REACT_APP_AWS_SURVEY_RESPONSES_SUMMARY_INDEX=SummaryIndex
```

for example:

```
# AWS configuration

REACT_APP_DEPLOY_ENVIRONMENT=DEV

# Authentication
REACT_APP_AWS_REGION=eu-west-2
REACT_APP_AWS_IDENTITY_POOL_ID=eu-west-2:00000000-0000-0000-0000-000000000000
REACT_APP_AWS_USER_POOL_ID=eu-west-2_000000000
REACT_APP_AWS_USER_POOL_WEB_CLIENT_ID=00000000000000000000000000

# Photo Storage
REACT_APP_AWS_SURVEY_RESOURCES_S3_BUCKET=PREFIX-dev-surveyresources

# Dynamo DB Table
REACT_APP_AWS_SURVEY_RESPONSES_TABLE=PREFIX-dev-SurveyResponses
REACT_APP_AWS_SURVEY_RESPONSES_SUMMARY_INDEX=SummaryIndex
```

Copy `PROJECT_ROOT/surveyclient/.env` to `PROJECT_ROOT/surveyclient/.env.local` and fill in the AWS backend parameters (from the outputs above):

```
# AWS configuration

REACT_APP_DEPLOY_ENVIRONMENT=DEV

# Authentication
REACT_APP_AWS_REGION=eu-west-2
REACT_APP_AWS_USER_POOL_ID=[PREFIX-Backend-dev.Surveyuserpoolid]
REACT_APP_AWS_USER_POOL_WEB_CLIENT_ID=[PREFIX-Backend-dev.Surveyuserpoolwebclientid]

# Survey Client API Gateway
REACT_APP_AWS_CLIENT_API_ENDPOINT=[PREFIX-Backend-dev.LTLclientAPIendpoint]
```

#### Build the shared component

Create a production build of the [sharedcode](../sharedcode)

```
cd PROJECT_ROOT/sharedcode
npm install
npm run build
npm pack
```

#### Build the web clients

Create a production build of the [adminclient](../adminclient)

```
cd PROJECT_ROOT/adminclient
npm install
npm run build
```

Create a production build of the [surveyclient](../surveyclient)

```
cd PROJECT_ROOT/surveyclient
npm install
npm run build
```

### Deploy the frontend components - hosted with AWS

As the two web clients are static sites, you can either deploy to AWS and direct incoming traffic to the correct CloudFront distribution, or just host them on your own websites. To deploy to AWS:

```
cd PROJECT_ROOT/cdk-stacks
cdk deploy PREFIX-Frontend-dev --profile AWS_PROFILE --context env=dev --context nameprefix=PREFIX --context surveyEmailBcc=EMAIL_ADDRESS --context surveyEmailFrom=EMAIL_ADDRESS
```

Use the same environment and prefix as for the backend above. The CDK will create and deploy a CloudFormation stack of the frontend AWS components. If it completes successfully, it will return output like:

```
✅  LTLSurvey2-Frontend-dev

Outputs:
LTLSurvey2-Frontend-dev.AdminWebClientURL = https://0000000000000.cloudfront.net
LTLSurvey2-Frontend-dev.SurveyWebClientURL = https://0000000000000.cloudfront.net

Stack ARN:
arn:aws:cloudformation:eu-west-2:ACCOUNT_NUMBER:stack/LTLSurvey2-Frontend-dev/00000000-0000-0000-0000-000000000000
```

The web client URLs are the endpoints of the two web clients in cloudfront. These can then be set up with DNS, Route53, etc.

### or deploy the frontend components - hosted elsewhere

To host on your own website, build the web clients as described above and the copy the contents of the web client builds at `surveyclient/build` and `adminclient/build` to appropriate locations on your website.

## Building and deploying on other environments

The process is basically the same:

- Create an environment specific backend with the CDK backend stack
- Use the output to populate environment specific configuration for the web clients
- Build and deploy the frontend stack.

Multiple `.env.CONFIG` files can be maintained in the web client folders. The `package.json` of each of the web clients can be set to look for particular config files for particular builds:

```
"scripts": {
  ...
  "build:ltltest": "env-cmd -f .env.ltltest npm run build",
  "build:ltllive": "env-cmd -f .env.ltllive npm run build"
},
```

For example, `npm run build:ltltest` will create a build using the configuration in `.env.ltltest`.
