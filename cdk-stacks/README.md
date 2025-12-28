# CDK Deployment stack for LtL Survey Audit application

This project handles the CDK creation of backend resources and frontend deployments of the Admin and Survey React applications.

## Building and deploying

See the [monorepo build and deploy instructions](../README.md)

## AWS Deployment architecture

The LtL Survey consists of:

- Backend
  - A DynamoDB table of survey responses. Each item contains some indexing fields, the survey response in JSON format, and keys to photos submitted as part of the survey response
  - An S3 bucket containing the uploaded photos undexed above. The objects have keys `/surveys/[SURVEY UUID]/photos/[PHOTO UUID]`
  - Lambda functions for the survey client to [add](resources/addSurveyLambda) and [confirm](resources/confirmSurveyLambda) survey upload.
  - API Gateway wrapper for these lambda functions.
  - Asynchronous Lambda function to  [email](resources/emailSurveyLambda) survey responses to the survey user (triggered by [confirm](resources/confirmSurveyLambda). As some required libraries have binary dependencies, this Lambda function is created as a Docker image.
  - Cognito user pools for survey users and survey admin users. Separate pools to allow for greater admin user security.
  - Cognito identity pool to assign role to survey admin user pool, allowing read access to the DynamoDB table and the S3 bucket.
- Frontend
  - S3 buckets for the survey and admin web interfaces
  - CloudFront distributions for each of the web interfaces S3 buckets

The DynamoDB table, the photos S3 bucket and the two user pools are set to retain on delete, with fixed resource names to avoid a CloudFormation update replacing them (as their contents are not easily replaced).
