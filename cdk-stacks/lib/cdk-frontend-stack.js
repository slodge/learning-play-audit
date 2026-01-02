const cdk = require("aws-cdk-lib");
const { Bucket, BlockPublicAccess, CfnBucket } = require("aws-cdk-lib/aws-s3");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const origins = require("aws-cdk-lib/aws-cloudfront-origins");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");

class CdkFrontendStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, stackId, props) {
    super(scope, stackId, props);

    // React website hosting - survey client
    addHostedWebsite(this, "SurveyWebClient", "../surveyclient/build", "/survey");

    // React website hosting - admin client
    addHostedWebsite(this, "AdminWebClient", "../adminclient/build", "/");

    function addHostedWebsite(scope, name, pathToWebsiteContents, destinationKeyPrefix) {
      const BUCKET_NAME = name;
      const DISTRIBUTION_NAME = name + "Distribution";
      const DEPLOY_NAME = name + "DeployWithInvalidation";

      const bucket = new Bucket(
        scope, 
        BUCKET_NAME, {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
          // TODO - consider "AWS recommends using S3BucketOrigin with CloudFront Origin Access Control (OAC)" instead!
            publicReadAccess: true,             // Grants public read access
            blockPublicAccess: new BlockPublicAccess({
              blockPublicAcls: false,
              blockPublicPolicy: false,
              ignorePublicAcls: false,
              restrictPublicBuckets: false,
            }),
        });

      // // TODO - this is a mess!
      // // set websiteConfiguration on CfnBucket...
      // bucket.node.defaultChild.websiteConfiguration = {
      //   indexDocument: 'index.html',
      //   errorDocument: 'index.html',
      // };

      // TODO - this is a mess too... shouldn't need a default and additional behaviour...
      // need to clean this all up one day! (hopefully soon!)
      // seems like this change - https://github.com/Scottish-Tech-Army/learning-play-audit/commit/7bde289c181ec2e7964f034d8b48039b9d03f73c 
      // never made it to the cdk change code :)
      // CloudFront Function to strip the destinationKeyPrefix from the request URI
      // so that requests to /prefix/... are forwarded to the bucket as /...
      const viewerRequestFunction = new cloudfront.Function(scope, `${name}StripPrefixFunction`, {
        code: cloudfront.FunctionCode.fromInline(
          `function handler(event) {
              var request = event.request;
              var uri = request.uri || '/';
              var prefix = "${destinationKeyPrefix}";
              if (prefix && prefix !== '/' && uri.indexOf(prefix) === 0) {
                var newUri = uri.substring(prefix.length);
                if (newUri === '') newUri = '/';
                request.uri = newUri;
              }
              return request;
            }`
        ),
      });

      const additionalBehaviors = (destinationKeyPrefix && destinationKeyPrefix !== '/') ? {
        [`${destinationKeyPrefix}/*`]: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          functionAssociations: [
            {
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
              function: viewerRequestFunction,
            },
          ],
        },
      } : undefined;

      const distribution = new cloudfront.Distribution(
        scope,
        DISTRIBUTION_NAME,
        {
          defaultBehavior: {
            origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
            allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
            viewerProtocolPolicy:
              cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          },
          additionalBehaviors: additionalBehaviors,
          defaultRootObject: 'index.html',
        }
      );

      new s3deploy.BucketDeployment(scope, DEPLOY_NAME, {
        sources: [s3deploy.Source.asset(pathToWebsiteContents)],
        destinationBucket: bucket,
        destinationKeyPrefix: destinationKeyPrefix,
        distribution: distribution,
        distributionPaths: [ `${destinationKeyPrefix}/*`], // Invalidates cache on deploy
      });

      new cdk.CfnOutput(scope, name + " URL", {
        value: "https://" + distribution.domainName,
        description: "External URL for " + name + " website",
      });
    }
  }
}

module.exports = { CdkFrontendStack };
