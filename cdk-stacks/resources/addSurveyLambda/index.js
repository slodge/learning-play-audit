require("es6-promise").polyfill();
require("isomorphic-fetch");
const uuid = require("uuid");
const { dynamodbClient, lambdaClient } = require("./aws");

const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { InvokeCommand, InvocationType } = require("@aws-sdk/client-lambda");
const STATE_COMPLETE = "Complete";

function storeSurveyResponse(surveyResponse) {
  console.log("storeSurveyResponse", JSON.stringify(surveyResponse));

  var creationDate = new Date().toISOString();

  var params = {
    TableName: process.env.SURVEY_DB_TABLE,
    Item: marshall({
      __typename: "SurveyResponse",
      uploadState: STATE_COMPLETE,
      createdAt: creationDate,
      updatedAt: creationDate,
      ...surveyResponse,
    }),
  };

  console.log("Adding a new item...", params);
  return dynamodbClient.send(new PutItemCommand(params));
}

async function sendSurveyConfirmationEmail(surveyId) {
  console.log("Async send email");
  const command = new InvokeCommand({
    FunctionName: process.env.EMAIL_FUNCTION,
    InvocationType: InvocationType.Event,
    Payload: JSON.stringify({ surveyId }),
  });
  console.log("command created");

  const result = await lambdaClient
    .send(command);

      console.log("Async send email result", result);
    //.catch((err) => console.log("Failed", err));
}

exports.handler = async (event) => {
  console.log("Incoming request");
  const inputRequest = JSON.parse(event.body);
  console.log(inputRequest);

  const survey = inputRequest.survey;
  const surveyId = uuid.v4();
  const clientSurveyId = inputRequest.uuid;
  console.log("Mapping survey id: " + clientSurveyId + " -> " + surveyId);

  const surveyResponse = {
    id: surveyId,
    surveyVersion: inputRequest.surveyVersion,
    surveyResponse: survey,
    schoolName: survey.background.organisation.answer,
    responderName: `${survey.background.firstname.answer} ${survey.background.lastname.answer}`,
    responderEmail: survey.background.email.answer,
  };

  console.log("store survey", JSON.stringify(surveyResponse));
  const result = await storeSurveyResponse(surveyResponse);
  console.log("store survey result", result);
  await sendSurveyConfirmationEmail(surveyId);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
    },
    body: JSON.stringify({ result: "Submission complete" }),
  };
};
