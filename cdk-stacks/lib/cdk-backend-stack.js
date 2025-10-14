const cdk = require("aws-cdk-lib");
const { HttpMethods, Bucket } = require("aws-cdk-lib/aws-s3");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const { NodejsFunction } = require("aws-cdk-lib/aws-lambda-nodejs");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const cognito = require("aws-cdk-lib/aws-cognito");
const iam = require("aws-cdk-lib/aws-iam");

class CdkBackendStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, stackId, props) {
    super(scope, stackId, props);

    // Common resources
    const stack = cdk.Stack.of(this);
    const region = stack.region;
    const { environment, resourcePrefix, surveyEmailBcc, surveyEmailFrom } =
      props;

    // The following are fixed resource names with environment stage suffixes
    // These resources will not be replaced during updates
    const SURVEY_RESOURCES_BUCKET_NAME =
      resourcePrefix.toLowerCase() + "-surveyresources";
    const SURVEY_RESPONSES_TABLE_NAME = resourcePrefix + "-SurveyResponses";
    const SURVEY_CLIENT_USERPOOL_ID = resourcePrefix + "-SurveyUserPool";
    const SURVEY_ADMIN_USERPOOL_ID = resourcePrefix + "-SurveyAdminPool";

    const surveyResourcesBucket = new Bucket(this, "SurveyResources", {
      bucketName: SURVEY_RESOURCES_BUCKET_NAME,
    });
    surveyResourcesBucket.addCorsRule({
      allowedHeaders: ["*"],
      allowedMethods: [
        HttpMethods.GET,
        HttpMethods.HEAD,
        HttpMethods.PUT,
        HttpMethods.POST,
        HttpMethods.DELETE,
      ],
      allowedOrigins: ["*"],
      exposeHeaders: [
        "x-amz-server-side-encryption",
        "x-amz-request-id",
        "x-amz-id-2",
        "ETag",
      ],
      maxAge: 3000,
    });
    new cdk.CfnOutput(this, "SurveyResources bucket", {
      value: surveyResourcesBucket.bucketName,
      description: "S3 bucket containing uploaded survey resources",
    });

    const surveyResponsesTable = new dynamodb.Table(this, "SurveyResponses", {
      tableName: SURVEY_RESPONSES_TABLE_NAME,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });
    new cdk.CfnOutput(this, "SurveyResponses table", {
      value: surveyResponsesTable.tableName,
      description: "DynamoDB table containing survey responses",
    });
    surveyResponsesTable.addGlobalSecondaryIndex({
      indexName: "SummaryIndex",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: [
        "responderName",
        "schoolName",
        "uploadState",
        "responderEmail",
      ],

      
      // Stuart removed the readCapicty - we want on demand? 
      //,
      // Only increase RTU for live site
      //readCapacity: environment === "live" ? 10 : 5,
    });
    new cdk.CfnOutput(this, "SurveyResponseSummaries index", {
      value: "SummaryIndex",
      description: "DynamoDB index for survey response summaries",
    });

    // Survey client resources

    const restApi = new apigateway.RestApi(this, "SurveyClientApi", {
      restApiName: "LTL Survey Client Service (" + environment + ")",
      description: "This service receives LTL Audit Survey reponses.",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });
    new cdk.CfnOutput(this, "LTL client API endpoint", {
      value: restApi.urlForPath(),
      description: "API Gateway endpoint for survey submission API",
    });

    const surveyClientUserPool = new cognito.UserPool(this, "SurveyUserPool", {
      userPoolName: SURVEY_CLIENT_USERPOOL_ID,
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject:
          "Please verify your email for the Learning through Landscapes Audit Survey",
        emailBody:
          "This email address was recently added as your Learning through Landscapes contact email address. " +
          "Please enter the confirmation code {####} in the audit survey to verify your email address.",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      signInAliases: { email: true },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
      },
    });
    surveyClientUserPool.node.defaultChild.applyRemovalPolicy(
      cdk.RemovalPolicy.RETAIN
    );
    new cdk.CfnOutput(this, "Survey user pool id", {
      value: surveyClientUserPool.userPoolId,
      description: "User pool id for survey users",
    });

    const surveyClientUserPoolAppClient = surveyClientUserPool.addClient(
      "SurveyUserPoolAppClient",
      {
        accessTokenValidity: cdk.Duration.minutes(60),
        idTokenValidity: cdk.Duration.minutes(60),
        refreshTokenValidity: cdk.Duration.days(30),
      }
    );
    new cdk.CfnOutput(this, "Survey user pool web client id", {
      value: surveyClientUserPoolAppClient.userPoolClientId,
      description: "User pool web client id for survey users",
    });

    const apiAuthoriser = new apigateway.CfnAuthorizer(
      this,
      "SurveyClientApiAuth",
      {
        restApiId: restApi.restApiId,
        type: "COGNITO_USER_POOLS",
        identitySource: "method.request.header.Authorization",
        providerArns: [surveyClientUserPool.userPoolArn],
        name: "SurveyClientApiAuth",
      }
    );

    const addSurveyLambda = new NodejsFunction(this, "AddSurveyLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "resources/addSurveyLambda/index.js",
      handler: "handler",
      environment: {
        REGION: region,
        SURVEY_DB_TABLE: surveyResponsesTable.tableName,
        SURVEY_RESOURCES_BUCKET: surveyResourcesBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(30),
      commandHooks: {
        beforeBundling(inputDir) {
          return [`cd ${inputDir} && npm install`];
        },
      },
    });

    surveyResponsesTable.grant(addSurveyLambda, "dynamodb:PutItem");
    surveyResourcesBucket.grantPut(addSurveyLambda);

    addApiGatewayMethod(
      restApi,
      "survey",
      "POST",
      addSurveyLambda,
      apiAuthoriser
    );

    const emailSurveyLambda = new lambda.DockerImageFunction(
      this,
      "EmailSurveyLambdaDocker",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          "./resources/emailSurveyLambda",
          {}
        ),
        timeout: cdk.Duration.seconds(600),
        memorySize: 512,
        environment: {
          REGION: region,
          SURVEY_DB_TABLE: surveyResponsesTable.tableName,
          SURVEY_EMAIL_BCC: surveyEmailBcc,
          SURVEY_EMAIL_FROM: surveyEmailFrom,
        },
      }
    );

    surveyResponsesTable.grant(emailSurveyLambda, "dynamodb:GetItem");
    surveyResourcesBucket.grantRead(emailSurveyLambda);

    emailSurveyLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["SES:SendRawEmail"],
        resources: ["*"],
        effect: iam.Effect.ALLOW,
      })
    );

    const confirmSurveyLambda = new NodejsFunction(
      this,
      "ConfirmSurveyLambda",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: "resources/confirmSurveyLambda/index.js",
        handler: "handler",
        environment: {
          REGION: region,
          SURVEY_DB_TABLE: surveyResponsesTable.tableName,
          EMAIL_FUNCTION: emailSurveyLambda.functionName,
        },
        timeout: cdk.Duration.seconds(30),
      }
    );

    surveyResponsesTable.grant(
      confirmSurveyLambda,
      "dynamodb:GetItem",
      "dynamodb:PutItem"
    );
    surveyResourcesBucket.grantReadWrite(confirmSurveyLambda);

    addApiGatewayMethod(
      restApi,
      "confirmsurvey",
      "POST",
      confirmSurveyLambda,
      apiAuthoriser
    );

    emailSurveyLambda.grantInvoke(confirmSurveyLambda);

    // Admin client

    const adminClientUserPool = new cognito.UserPool(this, "SurveyAdminPool", {
      userPoolName: SURVEY_ADMIN_USERPOOL_ID,
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: {
        sms: false,
        otp: true,
      },
    });
    adminClientUserPool.node.defaultChild.applyRemovalPolicy(
      cdk.RemovalPolicy.RETAIN
    );
    new cdk.CfnOutput(this, "Survey admin user pool id", {
      value: adminClientUserPool.userPoolId,
      description: "User pool id for admin users",
    });

    const adminClientUserPoolClient = adminClientUserPool.addClient(
      "SurveyAdminPoolAppClient",
      {
        accessTokenValidity: cdk.Duration.minutes(60),
        idTokenValidity: cdk.Duration.minutes(60),
        refreshTokenValidity: cdk.Duration.days(30),
      }
    );
    new cdk.CfnOutput(this, "Survey admin user pool web client id", {
      value: adminClientUserPoolClient.userPoolClientId,
      description: "User pool web client id for admin users",
    });

    const adminClientIdentityPool = new cognito.CfnIdentityPool(
      this,
      "AdminClientIdentityPool",
      {
        allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
        cognitoIdentityProviders: [
          {
            clientId: adminClientUserPoolClient.userPoolClientId,
            providerName: adminClientUserPool.userPoolProviderName,
          },
        ],
      }
    );
    new cdk.CfnOutput(this, "Survey admin identity pool id", {
      value: adminClientIdentityPool.ref,
      description: "Identity pool id for admin users",
    });

    // IAM role used for authenticated users
    const adminClientAuthenticatedRole = new iam.Role(
      this,
      "AdminClientAuthRole",
      {
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": adminClientIdentityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );
    adminClientAuthenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "mobileanalytics:PutEvents",
          "cognito-sync:*",
          "cognito-identity:*",
        ],
        resources: ["*"],
      })
    );

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "AdminClientIdentityPoolRoleAttachment",
      {
        identityPoolId: adminClientIdentityPool.ref,
        roles: { authenticated: adminClientAuthenticatedRole.roleArn },
      }
    );

    surveyResponsesTable.grant(
      adminClientAuthenticatedRole,
      "dynamodb:BatchGetItem",
      "dynamodb:GetItem",
      "dynamodb:Scan"
    );

    surveyResourcesBucket.grantRead(adminClientAuthenticatedRole);

    function addApiGatewayMethod(
      restApi,
      resourcePath,
      method,
      lambdaFunction,
      apiAuthoriser
    ) {
      const resource = restApi.root.addResource(resourcePath);

      const postMethod = resource.addMethod(
        method,
        new apigateway.LambdaIntegration(lambdaFunction)
      );

      const postMethodResource = postMethod.node.findChild("Resource");
      postMethodResource.addPropertyOverride(
        "AuthorizationType",
        "COGNITO_USER_POOLS"
      );
      postMethodResource.addPropertyOverride("AuthorizerId", {
        Ref: apiAuthoriser.logicalId,
      });
    }
  }
}

module.exports = { CdkBackendStack };
