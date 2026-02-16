const cdk = require("aws-cdk-lib");
const acm = require("aws-cdk-lib/aws-certificatemanager");

class CdkFrontendCertStack extends cdk.Stack {
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, stackId, props) {
    super(scope, stackId, props);

    const { surveyDomain, adminDomain } = props;

    const certificate = new acm.Certificate(this, "FrontendCertificate", {
      domainName: surveyDomain,
      subjectAlternativeNames: [adminDomain],
      validation: acm.CertificateValidation.fromDns(),
    });
    this.certificateArn = certificate.certificateArn;

    new cdk.CfnOutput(this, "FrontendCertArn", {
      value: certificate.certificateArn,
      description: "ACM certificate ARN for CloudFront custom domains",
    });

    new cdk.CfnOutput(this, "SurveyCustomDomain", {
      value: surveyDomain,
      description: "Custom domain for survey client",
    });

    new cdk.CfnOutput(this, "AdminCustomDomain", {
      value: adminDomain,
      description: "Custom domain for admin client",
    });
  }
}

module.exports = { CdkFrontendCertStack };
