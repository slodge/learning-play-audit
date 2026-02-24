#!/usr/bin/env node

const cdk = require("aws-cdk-lib");
const { CdkBackendStack } = require("../lib/cdk-backend-stack");
const { CdkFrontendStack } = require("../lib/cdk-frontend-stack");
const { CdkFrontendCertStack } = require("../lib/cdk-frontend-cert-stack");

const app = new cdk.App();
const envStageName = app.node.tryGetContext("env");
const resourcePrefixName = app.node.tryGetContext("nameprefix");
const surveyEmailBcc = app.node.tryGetContext("surveyEmailBcc");
const surveyEmailFrom = app.node.tryGetContext("surveyEmailFrom");
const domainBase = app.node.tryGetContext("domainBase");
const defaultAccount = process.env.CDK_DEFAULT_ACCOUNT;
const defaultRegion = process.env.CDK_DEFAULT_REGION;

if (
  !envStageName ||
  !resourcePrefixName ||
  !surveyEmailBcc ||
  !surveyEmailFrom ||
  !domainBase
) {
  throw new Error(
    `run with parameters:
  --context nameprefix=AWS_RESOURCE_NAME_PREFIX
  --context surveyEmailBcc=EMAIL_ADDRESS
  --context surveyEmailFrom=EMAIL_ADDRESS
  --context env=ENVIRONMENT_NAME (i.e. dev, test, live, etc.)
  --context domainBase=BASE_DOMAIN (e.g. slodge.com or ltl.org.uk)`
  );
}

function buildDomain(envName, baseDomain, label) {
  const normalisedBase = baseDomain.toLowerCase();
  const normalisedEnv = envName.toLowerCase();
  if (normalisedEnv === "live") {
    return `${label}.${normalisedBase}`;
  }
  return `${label}.${normalisedEnv}.${normalisedBase}`;
}

const surveyDomain = buildDomain(envStageName, domainBase, "groundsaudit");
const adminDomain = buildDomain(envStageName, domainBase, "groundsauditadmin");

const backendStack = new CdkBackendStack(
  app,
  resourcePrefixName + "-Backend-" + envStageName,
  {
    env: {
      account: defaultAccount,
      region: defaultRegion,
    },
    environment: envStageName,
    surveyEmailBcc,
    surveyEmailFrom,
    resourcePrefix: resourcePrefixName + "-" + envStageName,
  }
);

const frontendCertStack = new CdkFrontendCertStack(
  app,
  resourcePrefixName + "-FrontendCert-" + envStageName,
  {
    env: {
      account: defaultAccount,
      region: "us-east-1",
    },
    surveyDomain,
    adminDomain,
  }
);

const frontendStack = new CdkFrontendStack(
  app,
  resourcePrefixName + "-Frontend-" + envStageName,
  {
    crossRegionReferences: true,
    env: {
      account: defaultAccount,
      region: defaultRegion,
    },
    surveyDomain,
    adminDomain,
    certificateArn: frontendCertStack.certificateArn,
  }
);

cdk.Tags.of(backendStack).add("DeployEnvironment", envStageName);
cdk.Tags.of(frontendStack).add("DeployEnvironment", envStageName);
cdk.Tags.of(frontendCertStack).add("DeployEnvironment", envStageName);
