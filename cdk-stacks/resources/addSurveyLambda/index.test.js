import { handler } from "./index";
const { dynamodbClient, lambdaClient } = require("./aws");
const { PutItemCommand } = require("@aws-sdk/client-dynamodb");

const FIXED_UUID = "12345678-0000-0000-0000-000000000000";

jest.mock("./aws");
jest.mock("uuid", () => ({ v4: () => FIXED_UUID }));

const NOW = new Date('2026-05-14');
jest.useFakeTimers().setSystemTime(NOW);


describe("handler", () => {
  const EMPTY_SCALE_AND_COMMENT = {
    M: { answer: { S: "" }, comments: { S: "" } },
  };


  const SURVEY_ANSWERS = {
    background: {
      firstname: { answer: "Test", comments: "" },
      lastname: { answer: "User", comments: "" },
      jobtitle: { answer: "", comments: "" },
      organisation: { answer: "school1", comments: "" },
      postcode: { answer: "", comments: "" },
      agegroup: { answer: "", comments: "" },
      email: { answer: "testuser@example.com", comments: "" }
    },
    pandp: {
      P01: { answer: "", comments: "" },
      P02: { answer: "", comments: "" },
      P03: { answer: "", comments: "" },
      P04: { answer: "", comments: "" },
      // Truncated
    },
    nature: {
      GC01: { answer: "", comments: "" },
      GC02: { answer: "", comments: "" },
      GC03: { answer: "", comments: "" },
      GC04: { answer: "", comments: "" },
      // Truncated
    },
  };




  const EXPECTED_DB_INPUT = {
    id: { S: FIXED_UUID },
    responderName: { S: "Test User" },
    __typename: { S: "SurveyResponse" },
    responderEmail: { S: "testuser@example.com" },
    updatedAt: { S: NOW.toISOString() },
    schoolName: { S: "school1" },
    createdAt: { S: NOW.toISOString() },
    surveyVersion: { S: "0.1.11" },
    uploadState: { S: "Complete" },
    surveyResponse: {
      M: {
        background: {
          M: {
            firstname: {
              M: { answer: { S: "Test" }, comments: { S: "" } },
            },
            lastname: {
              M: { answer: { S: "User" }, comments: { S: "" } },
            },
            email: {
              M: { answer: { S: "testuser@example.com" }, comments: { S: "" } },
            },
            jobtitle: EMPTY_SCALE_AND_COMMENT,
            organisation: {
              M: { answer: { S: "school1" }, comments: { S: "" } },
            },
            postcode: EMPTY_SCALE_AND_COMMENT,
            agegroup: EMPTY_SCALE_AND_COMMENT,
          },
        },
        pandp: {
          M: {
            P01: EMPTY_SCALE_AND_COMMENT,
            P02: EMPTY_SCALE_AND_COMMENT,
            P03: EMPTY_SCALE_AND_COMMENT,
            P04: EMPTY_SCALE_AND_COMMENT,
            // Truncated
          }
        },
        nature: {
          M: {
            GC01: EMPTY_SCALE_AND_COMMENT,
            GC02: EMPTY_SCALE_AND_COMMENT,
            GC03: EMPTY_SCALE_AND_COMMENT,
            GC04: EMPTY_SCALE_AND_COMMENT,
            // Truncated
          }
        },
      },
    },
  };

  it("invoke", async () => {
    dynamodbClient.send.mockResolvedValue({});
    lambdaClient.send.mockResolvedValue({});

    const response = await handler({
      body: JSON.stringify({
        uuid: "eb06ed58-3eaf-40de-96b9-7c18ee40bad9",
        survey: SURVEY_ANSWERS,
        surveyVersion: "0.1.11",
      }),
    });
    expect(response).toEqual({
      body: '{"result":"Submission complete"}',
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    });

    expect(dynamodbClient.send).toHaveBeenCalledTimes(1);
    expect(dynamodbClient.send.mock.calls[0][0].input).toEqual({
      TableName: process.env.SURVEY_DB_TABLE,
      Item: EXPECTED_DB_INPUT,
    });

    expect(lambdaClient.send).toHaveBeenCalledTimes(1);
    expect(lambdaClient.send.mock.calls[0][0].input).toEqual({
      "FunctionName": "testEmailFunctionName", // From jest/setEnvVars.js
      "InvocationType": "Event",
      "Payload": JSON.stringify({ "surveyId": FIXED_UUID })
    });
  });

});
