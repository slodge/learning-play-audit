import { handler } from "./index";
import { dynamodbClient } from "./aws";

jest.mock("./aws");

// SORRY ... these tests require a lot of work to get them working... so left for now

describe("handler", () => {
  const EMPTY_SCALE_AND_COMMENT = {
    M: { answer: { S: "" }, comments: { S: "" } },
  };

  const DB_RESPONSE = {
    Item: {
      id: { S: "ba80fbb1-d612-4b54-ae4c-203d1b122f4c" },
      responderName: { S: "Test User" },
      __typename: { S: "SurveyResponse" },
      photos: {
        L: [
          {
            M: {
              bucket: { S: "test-dev-surveyresources" },
              fullsize: {
                M: {
                  width: { N: "400" },
                  uploadKey: { NULL: true },
                  key: {
                    S: "surveys/ba80fbb1-d612-4b54-ae4c-203d1b122f4c/photos/48d6dd87-0df1-4a26-a033-b0d8f1605c79",
                  },
                  height: { N: "300" },
                },
              },
              description: { S: "test photo" },
            },
          },
        ],
      },
      surveyResponse: {
        M: {
          play: {
            M: {
              tyres: EMPTY_SCALE_AND_COMMENT,
              jumping: EMPTY_SCALE_AND_COMMENT,
              markings: EMPTY_SCALE_AND_COMMENT,
              woodland: EMPTY_SCALE_AND_COMMENT,
              soil: EMPTY_SCALE_AND_COMMENT,
              trails: EMPTY_SCALE_AND_COMMENT,
              slopes: EMPTY_SCALE_AND_COMMENT,
              storage: EMPTY_SCALE_AND_COMMENT,
              straw: EMPTY_SCALE_AND_COMMENT,
              den: EMPTY_SCALE_AND_COMMENT,
              targets: EMPTY_SCALE_AND_COMMENT,
              trunks: EMPTY_SCALE_AND_COMMENT,
              balancing: EMPTY_SCALE_AND_COMMENT,
              sand: EMPTY_SCALE_AND_COMMENT,
              rocks: EMPTY_SCALE_AND_COMMENT,
              grass: EMPTY_SCALE_AND_COMMENT,
              bark: EMPTY_SCALE_AND_COMMENT,
              bushes: EMPTY_SCALE_AND_COMMENT,
              swinging: EMPTY_SCALE_AND_COMMENT,
              physical: EMPTY_SCALE_AND_COMMENT,
              climbing: EMPTY_SCALE_AND_COMMENT,
            },
          },
          practice: {
            M: {
              curriculumtopic: EMPTY_SCALE_AND_COMMENT,
              playrain: EMPTY_SCALE_AND_COMMENT,
              typesofplay: EMPTY_SCALE_AND_COMMENT,
              resources: EMPTY_SCALE_AND_COMMENT,
              monitoring: EMPTY_SCALE_AND_COMMENT,
              developingcurriculum: EMPTY_SCALE_AND_COMMENT,
              allages: EMPTY_SCALE_AND_COMMENT,
              outcomes: EMPTY_SCALE_AND_COMMENT,
              outofsight: EMPTY_SCALE_AND_COMMENT,
              growfood: EMPTY_SCALE_AND_COMMENT,
              playpolicy: EMPTY_SCALE_AND_COMMENT,
              principles: EMPTY_SCALE_AND_COMMENT,
              skillstraining: EMPTY_SCALE_AND_COMMENT,
              oldersupervising: EMPTY_SCALE_AND_COMMENT,
              playsnow: EMPTY_SCALE_AND_COMMENT,
            },
          },
          greenspace: {
            M: {
              accessible: EMPTY_SCALE_AND_COMMENT,
              improveteaching: EMPTY_SCALE_AND_COMMENT,
              improveaccessible: EMPTY_SCALE_AND_COMMENT,
              frequentuse: EMPTY_SCALE_AND_COMMENT,
              improvewildlife: EMPTY_SCALE_AND_COMMENT,
              changes: EMPTY_SCALE_AND_COMMENT,
              listowner: EMPTY_SCALE_AND_COMMENT,
              teaching: EMPTY_SCALE_AND_COMMENT,
              namegreenspace: EMPTY_SCALE_AND_COMMENT,
              wildlife: EMPTY_SCALE_AND_COMMENT,
            },
          },
          reflection: {
            M: {
              straightforward: EMPTY_SCALE_AND_COMMENT,
              ideas: EMPTY_SCALE_AND_COMMENT,
              onlineresources: EMPTY_SCALE_AND_COMMENT,
              CPD: EMPTY_SCALE_AND_COMMENT,
              groundsadvisor: EMPTY_SCALE_AND_COMMENT,
            },
          },
          background: {
            M: {
              contactname: {
                M: { answer: { S: "Test User" }, comments: { S: "" } },
              },
              telephone: EMPTY_SCALE_AND_COMMENT,
              localauthority: EMPTY_SCALE_AND_COMMENT,
              position: EMPTY_SCALE_AND_COMMENT,
              school: EMPTY_SCALE_AND_COMMENT,
              email: { M: { answer: { S: "testuser@example.com" } } },
            },
          },
          wellbeing: {
            M: {
              shelterrain: EMPTY_SCALE_AND_COMMENT,
              attractive: EMPTY_SCALE_AND_COMMENT,
              seatingsizes: EMPTY_SCALE_AND_COMMENT,
              shade: EMPTY_SCALE_AND_COMMENT,
              socialspaces: EMPTY_SCALE_AND_COMMENT,
              seating: EMPTY_SCALE_AND_COMMENT,
              shelterwind: EMPTY_SCALE_AND_COMMENT,
              outdoorart: EMPTY_SCALE_AND_COMMENT,
              colourful: EMPTY_SCALE_AND_COMMENT,
              quiet: EMPTY_SCALE_AND_COMMENT,
              schoolmeals: EMPTY_SCALE_AND_COMMENT,
              packedlunches: EMPTY_SCALE_AND_COMMENT,
              goodimpression: EMPTY_SCALE_AND_COMMENT,
            },
          },
          learning: {
            M: {
              technologies: EMPTY_SCALE_AND_COMMENT,
              disturbance: EMPTY_SCALE_AND_COMMENT,
              languages: EMPTY_SCALE_AND_COMMENT,
              social: EMPTY_SCALE_AND_COMMENT,
              maths: EMPTY_SCALE_AND_COMMENT,
              science: EMPTY_SCALE_AND_COMMENT,
              classroom: EMPTY_SCALE_AND_COMMENT,
              RME: EMPTY_SCALE_AND_COMMENT,
              arts: EMPTY_SCALE_AND_COMMENT,
              seating: EMPTY_SCALE_AND_COMMENT,
              sheltered: EMPTY_SCALE_AND_COMMENT,
            },
          },
          community: {
            M: {
              staffdesign: EMPTY_SCALE_AND_COMMENT,
              managelitter: EMPTY_SCALE_AND_COMMENT,
              manageother: EMPTY_SCALE_AND_COMMENT,
              communityoutside: EMPTY_SCALE_AND_COMMENT,
              othercommunity: EMPTY_SCALE_AND_COMMENT,
              adultsoutside: EMPTY_SCALE_AND_COMMENT,
              pupilsdesign: EMPTY_SCALE_AND_COMMENT,
              managegrowing: EMPTY_SCALE_AND_COMMENT,
              childrenoutside: EMPTY_SCALE_AND_COMMENT,
              datedImprovements: {
                M: {
                  answer3: { S: "" },
                  answer2: { S: "" },
                  year1: { S: "" },
                  year2: { S: "" },
                  answer1: { S: "" },
                  year3: { S: "" },
                },
              },
              parentsdesign: EMPTY_SCALE_AND_COMMENT,
            },
          },
          sustainability: {
            M: {
              ponds: EMPTY_SCALE_AND_COMMENT,
              composting: EMPTY_SCALE_AND_COMMENT,
              litterbins: EMPTY_SCALE_AND_COMMENT,
              flowers: EMPTY_SCALE_AND_COMMENT,
              growingfood: EMPTY_SCALE_AND_COMMENT,
              shrubs: EMPTY_SCALE_AND_COMMENT,
              nature: EMPTY_SCALE_AND_COMMENT,
              trees: EMPTY_SCALE_AND_COMMENT,
              cycle: EMPTY_SCALE_AND_COMMENT,
              birdboxes: EMPTY_SCALE_AND_COMMENT,
              renewableenergy: EMPTY_SCALE_AND_COMMENT,
              deadwood: EMPTY_SCALE_AND_COMMENT,
              bughotels: EMPTY_SCALE_AND_COMMENT,
              meadow: EMPTY_SCALE_AND_COMMENT,
              fruittrees: EMPTY_SCALE_AND_COMMENT,
            },
          },
        },
      },
      responderEmail: { S: "testuser@example.com" },
      updatedAt: { S: "2021-01-12T10:32:05.769Z" },
      schoolName: { S: "" },
      createdAt: { S: "2021-01-12T10:32:03.162Z" },
      surveyVersion: { S: "0.9.0" },
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
