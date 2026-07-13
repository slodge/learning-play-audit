import { handler } from "./index";
import { dynamodbClient } from "./aws";

jest.mock("./aws");

describe("handler", () => {
  const EMPTY_SCALE_AND_COMMENT = {
    M: { answer: { S: "" }, comments: { S: "" } },
  };

  const DB_RESPONSE = {
    Item: {
      id: { S: "ba80fbb1-d612-4b54-ae4c-203d1b122f4c" },
      responderName: { S: "Test User" },
      __typename: { S: "SurveyResponse" },
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
              jobtitle: EMPTY_SCALE_AND_COMMENT,
              organisation: EMPTY_SCALE_AND_COMMENT,
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
              P05: EMPTY_SCALE_AND_COMMENT,
              P06: EMPTY_SCALE_AND_COMMENT,
              P07: EMPTY_SCALE_AND_COMMENT,
              P08: EMPTY_SCALE_AND_COMMENT,
              P09: EMPTY_SCALE_AND_COMMENT,
              P10: EMPTY_SCALE_AND_COMMENT,
              P11: EMPTY_SCALE_AND_COMMENT,
              P12: EMPTY_SCALE_AND_COMMENT,
              P13: EMPTY_SCALE_AND_COMMENT,
              P14: EMPTY_SCALE_AND_COMMENT,
              P15: EMPTY_SCALE_AND_COMMENT,
              P17: EMPTY_SCALE_AND_COMMENT,
              P18: EMPTY_SCALE_AND_COMMENT,
              P19: EMPTY_SCALE_AND_COMMENT,
              P20: EMPTY_SCALE_AND_COMMENT,
              P21: EMPTY_SCALE_AND_COMMENT,
              P22: EMPTY_SCALE_AND_COMMENT,
              P23: EMPTY_SCALE_AND_COMMENT,
              P24: EMPTY_SCALE_AND_COMMENT,
              P25: EMPTY_SCALE_AND_COMMENT,
              P26: EMPTY_SCALE_AND_COMMENT,
              P27: EMPTY_SCALE_AND_COMMENT,
              P28: EMPTY_SCALE_AND_COMMENT,
              P29: EMPTY_SCALE_AND_COMMENT,
              P30: EMPTY_SCALE_AND_COMMENT,
              P31: EMPTY_SCALE_AND_COMMENT,
              P32: EMPTY_SCALE_AND_COMMENT,
            }
          },
          nature: {
            M: {
              GC01: EMPTY_SCALE_AND_COMMENT,
              GC02: EMPTY_SCALE_AND_COMMENT,
              GC03: EMPTY_SCALE_AND_COMMENT,
              GC04: EMPTY_SCALE_AND_COMMENT,
              GC05: EMPTY_SCALE_AND_COMMENT,
              GC06: EMPTY_SCALE_AND_COMMENT,
              GC07: EMPTY_SCALE_AND_COMMENT,
              GC08: EMPTY_SCALE_AND_COMMENT,
              N09: EMPTY_SCALE_AND_COMMENT,
              N10: EMPTY_SCALE_AND_COMMENT,
              N11: EMPTY_SCALE_AND_COMMENT,
              N12: EMPTY_SCALE_AND_COMMENT,
              N13: EMPTY_SCALE_AND_COMMENT,
              N14: EMPTY_SCALE_AND_COMMENT,
              N15: EMPTY_SCALE_AND_COMMENT,
              N16: EMPTY_SCALE_AND_COMMENT,
              SF01: EMPTY_SCALE_AND_COMMENT,
              SF02: EMPTY_SCALE_AND_COMMENT,
              SF03: EMPTY_SCALE_AND_COMMENT,
              SF04: EMPTY_SCALE_AND_COMMENT,
              SF06: EMPTY_SCALE_AND_COMMENT,
              SF07: EMPTY_SCALE_AND_COMMENT,
              SF08: EMPTY_SCALE_AND_COMMENT,
              SF09: EMPTY_SCALE_AND_COMMENT,
              SF10: EMPTY_SCALE_AND_COMMENT,
              SF11: EMPTY_SCALE_AND_COMMENT,
            }
          },
          temperature: {
            M: {
              T01: EMPTY_SCALE_AND_COMMENT,
              T02: EMPTY_SCALE_AND_COMMENT,
              T03: EMPTY_SCALE_AND_COMMENT,
              T04: EMPTY_SCALE_AND_COMMENT,
              T05: EMPTY_SCALE_AND_COMMENT,
              T06: EMPTY_SCALE_AND_COMMENT,
              T07: EMPTY_SCALE_AND_COMMENT,
              T08: EMPTY_SCALE_AND_COMMENT,
              T09: EMPTY_SCALE_AND_COMMENT,
              T10: EMPTY_SCALE_AND_COMMENT,
              T11: EMPTY_SCALE_AND_COMMENT,
              T12: EMPTY_SCALE_AND_COMMENT,
              T13: EMPTY_SCALE_AND_COMMENT,
              T14: EMPTY_SCALE_AND_COMMENT,
              T15: EMPTY_SCALE_AND_COMMENT,
              T17: EMPTY_SCALE_AND_COMMENT,
              T18: EMPTY_SCALE_AND_COMMENT,
              T19: EMPTY_SCALE_AND_COMMENT,
              T20: EMPTY_SCALE_AND_COMMENT,
              T21: EMPTY_SCALE_AND_COMMENT,
              T22: EMPTY_SCALE_AND_COMMENT,
              T23: EMPTY_SCALE_AND_COMMENT,
              T24: EMPTY_SCALE_AND_COMMENT,
              T25: EMPTY_SCALE_AND_COMMENT,
            }
          },
          water: {
            M: {
              WA01: EMPTY_SCALE_AND_COMMENT,
              WA02: EMPTY_SCALE_AND_COMMENT,
              WA03: EMPTY_SCALE_AND_COMMENT,
              WA04: EMPTY_SCALE_AND_COMMENT,
              WA05: EMPTY_SCALE_AND_COMMENT,
              WA06: EMPTY_SCALE_AND_COMMENT,
              WA07: EMPTY_SCALE_AND_COMMENT,
              WA08: EMPTY_SCALE_AND_COMMENT,
              WA10: EMPTY_SCALE_AND_COMMENT,
              WA11: EMPTY_SCALE_AND_COMMENT,
              WA12: EMPTY_SCALE_AND_COMMENT,
              WA13: EMPTY_SCALE_AND_COMMENT,
              WA14: EMPTY_SCALE_AND_COMMENT,
              WA15: EMPTY_SCALE_AND_COMMENT,
              WA16: EMPTY_SCALE_AND_COMMENT,
            }
          },
          carbon: {
            M: {
              C01: EMPTY_SCALE_AND_COMMENT,
              C02: EMPTY_SCALE_AND_COMMENT,
              C03: EMPTY_SCALE_AND_COMMENT,
              C04: EMPTY_SCALE_AND_COMMENT,
              C05: EMPTY_SCALE_AND_COMMENT,
              C06: EMPTY_SCALE_AND_COMMENT,
              C07: EMPTY_SCALE_AND_COMMENT,
            }
          },
          air: {
            M: {
              A01: EMPTY_SCALE_AND_COMMENT,
              A02: EMPTY_SCALE_AND_COMMENT,
              A03: EMPTY_SCALE_AND_COMMENT,
              A04: EMPTY_SCALE_AND_COMMENT,
              A05: EMPTY_SCALE_AND_COMMENT,
              A07: EMPTY_SCALE_AND_COMMENT,
            }
          },
        },
      },
      responderEmail: { S: "testuser@example.com" },
      updatedAt: { S: "2021-01-12T10:32:05.769Z" },
      schoolName: { S: "" },
      createdAt: { S: "2021-01-12T10:32:03.162Z" },
      surveyVersion: { S: "0.1.11" },
      state: { S: "Complete" },
    },
  };

  it("invoke", async () => {
    (dynamodbClient.send as jest.Mock).mockResolvedValue(DB_RESPONSE);

    const response = await handler({
      surveyId: "ba80fbb1-d612-4b54-ae4c-203d1b122f4c",
    });
    expect(response).toEqual({
      body: '{"result":"Survey email sent"}',
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    });
  });
});
