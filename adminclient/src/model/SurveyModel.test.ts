import {
  adminStore,
  surveyReducer,
  retrieveSummaryResponses,
  retrieveFullSurveyResponses,
  allSurveysRetrieved,
  AdminStoreState,
  SurveyResponse,
  SurveySummary,
} from "./SurveyModel";
import {
  REFRESH_STATE,
  SET_SUMMARY_RESPONSES,
  SET_FULL_RESPONSES,
} from "./ActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
  CONFIRM_SIGN_IN,
  SurveyUser,
} from "learning-play-audit-shared";
import rfdc from "rfdc";
import { Auth } from "@aws-amplify/auth";
import {
  DynamoDBClient,
  ScanCommand,
  BatchGetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

jest.mock("@aws-amplify/auth");
jest.mock("@aws-sdk/client-dynamodb");

const mockDynamodbClientSend = jest.fn();

const mockBatchGetItemCommand = BatchGetItemCommand as jest.Mock;

const adminDispatch: ThunkDispatch<AdminStoreState, any, AnyAction> =
  adminStore.dispatch;

beforeEach(() => {
  const AUTH_CREDENTIALS = "test credentials";

  (Auth.currentCredentials as jest.Mock).mockImplementation(() =>
    Promise.resolve(AUTH_CREDENTIALS)
  );
  (DynamoDBClient as jest.Mock).mockImplementation(() => {
    return { send: mockDynamodbClientSend };
  });

  mockDynamodbClientSend.mockReset();
});

const clone = rfdc();

const DB_TABLE = "dbtable-responses";
const DB_TABLE_INDEX = "dbtable-index-responses";

process.env.REACT_APP_AWS_REGION = "eu-west-2";
process.env.REACT_APP_AWS_SURVEY_RESPONSES_TABLE = DB_TABLE;
process.env.REACT_APP_AWS_SURVEY_RESPONSES_SUMMARY_INDEX = DB_TABLE_INDEX;

const TEST_EMAIL = "test@example.com";

const TEST_USER: SurveyUser = {
  email: TEST_EMAIL,
};

describe("surveyReducer", () => {
  it("initial state - empty", () => {
    expect(surveyReducer(undefined, {} as AnyAction)).toStrictEqual(
      EMPTY_STATE
    );
  });

  it("action SET_SUMMARY_RESPONSES", () => {
    expect(
      surveyReducer(
        { ...EMPTY_STATE, surveyResponses: [] },
        {
          type: SET_SUMMARY_RESPONSES,
          responses: [TEST_SUMMARY_RESPONSE1, TEST_SUMMARY_RESPONSE2],
        }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      surveyResponses: [TEST_SUMMARY_RESPONSE1, TEST_SUMMARY_RESPONSE2],
    });

    expect(
      surveyReducer(
        {
          ...EMPTY_STATE,
          surveyResponses: [TEST_SUMMARY_RESPONSE1, TEST_SUMMARY_RESPONSE2],
        },
        {
          type: SET_SUMMARY_RESPONSES,
          responses: [TEST_SUMMARY_RESPONSE3, TEST_SUMMARY_RESPONSE4],
        }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      surveyResponses: [TEST_SUMMARY_RESPONSE3, TEST_SUMMARY_RESPONSE4],
    });
  });

  it("action SET_FULL_RESPONSES", () => {
    expect(
      surveyReducer(
        { ...EMPTY_STATE, fullSurveyResponses: {} },
        {
          type: SET_FULL_RESPONSES,
          responses: { "1": TEST_FULL_RESPONSE1, "2": TEST_FULL_RESPONSE2 },
        }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      fullSurveyResponses: {
        "1": TEST_FULL_RESPONSE1,
        "2": TEST_FULL_RESPONSE2,
      },
    });

    expect(
      surveyReducer(
        {
          ...EMPTY_STATE,
          fullSurveyResponses: {
            "2": TEST_FULL_RESPONSE2,
            "3": TEST_FULL_RESPONSE3,
          },
        },
        {
          type: SET_FULL_RESPONSES,
          responses: { "1": TEST_FULL_RESPONSE1, "2": TEST_FULL_RESPONSE4 },
        }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      fullSurveyResponses: {
        "1": TEST_FULL_RESPONSE1,
        "2": TEST_FULL_RESPONSE4,
        "3": TEST_FULL_RESPONSE3,
      },
    });
  });

  it("action REFRESH_STATE", () => {
    expect(
      surveyReducer(EMPTY_STATE, {
        type: REFRESH_STATE,
        state: INPUT_STATE,
      })
    ).toStrictEqual(INPUT_STATE);

    expect(
      surveyReducer(INPUT_STATE, {
        type: REFRESH_STATE,
        state: EMPTY_STATE,
      })
    ).toStrictEqual(EMPTY_STATE);
  });
});

describe("surveyReducer using authReducer", () => {
  it("action SET_AUTH_ERROR", () => {
    expect(
      surveyReducer(STATE_WITHOUT_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "new error",
      })
    ).toStrictEqual(STATE_WITH_AUTH_ERROR);

    expect(
      surveyReducer(STATE_WITH_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "",
      })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);

    expect(
      surveyReducer(STATE_WITH_AUTH_ERROR, {
        type: SET_AUTH_ERROR,
        message: "new error",
      })
    ).toStrictEqual(STATE_WITH_AUTH_ERROR);
  });

  it("action CLEAR_AUTH_ERROR", () => {
    expect(
      surveyReducer(STATE_WITH_AUTH_ERROR, { type: CLEAR_AUTH_ERROR })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);

    expect(
      surveyReducer(STATE_WITHOUT_AUTH_ERROR, { type: CLEAR_AUTH_ERROR })
    ).toStrictEqual(STATE_WITHOUT_AUTH_ERROR);
  });

  it("action SET_AUTH_STATE", () => {
    expect(
      surveyReducer(
        {
          ...INPUT_STATE,
          surveyUser: { email: "test@example.com" },
          authState: SIGN_IN,
          errorMessage: "new error",
        },
        {
          type: SET_AUTH_STATE,
          authState: CONFIRM_SIGN_IN,
          surveyUser: { email: "new@example.com" },
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      errorMessage: "",
      authState: CONFIRM_SIGN_IN,
      surveyUser: { email: "new@example.com" },
    });
  });

  it("action SET_AUTH_STATE authState undefined", () => {
    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_AUTH_STATE,
        surveyUser: "new user",
      })
    ).toStrictEqual(INPUT_STATE);
  });
});

describe("retrieveSummaryResponses", () => {
  beforeEach(() => {
    adminDispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    mockDynamodbClientSend.mockImplementation(() =>
      Promise.resolve(DB_INDEX_RESPONSE)
    );
  });

  it("success", async () => {
    await adminDispatch(retrieveSummaryResponses());

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(ScanCommand).toHaveBeenCalledTimes(1);
    const scanParameters = (ScanCommand as jest.Mock).mock.calls[0][0];
    expect(scanParameters.TableName).toStrictEqual(DB_TABLE);
    expect(scanParameters.IndexName).toBe("SummaryIndex");

    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(adminStore.getState().surveyResponses).toStrictEqual([
      {
        createdAt: "2021-01-12T10:32:03.162Z",
        id: "surveyId1",
        responderEmail: "email1",
        responderName: "user1",
        schoolName: "school1",
        timestampString: "2021-01-12, 10:32:03 a.m.",
      },
      {
        createdAt: "2021-02-12T10:32:03.162Z",
        id: "surveyId2",
        responderEmail: "email2",
        responderName: "user2",
        schoolName: "school2",
        timestampString: "2021-02-12, 10:32:03 a.m.",
      },
    ]);
  });

  it("not signed in", async () => {
    adminDispatch({ type: REFRESH_STATE, state: clone(EMPTY_STATE) });
    await adminDispatch(retrieveSummaryResponses());

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(DynamoDBClient).not.toHaveBeenCalled();
    expect(mockDynamodbClientSend).not.toHaveBeenCalled();
    expect(adminStore.getState().surveyResponses).toStrictEqual([]);
  });

  it("error calling DynamoDB send", async () => {
    mockDynamodbClientSend.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await adminDispatch(retrieveSummaryResponses());

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(adminStore.getState().surveyResponses).toStrictEqual([]);
  });
});

describe("retrieveFullSurveyResponses", () => {
  beforeEach(() => {
    adminDispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    mockDynamodbClientSend.mockImplementation(() =>
      Promise.resolve(DB_FULL_RESPONSE)
    );
  });

  it("success - empty existing responses", async () => {
    await adminDispatch(
      retrieveFullSurveyResponses(["surveyId1", "surveyId2"])
    );

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(mockBatchGetItemCommand).toHaveBeenCalledTimes(1);
    expect(mockBatchGetItemCommand.mock.calls[0][0].RequestItems).toStrictEqual(
      {
        "dbtable-responses": {
          Keys: [{ id: { S: "surveyId1" } }, { id: { S: "surveyId2" } }],
        },
      }
    );
    expect(adminStore.getState().fullSurveyResponses).toStrictEqual(
      TEST_FULL_RESPONSES
    );
  });

  it("success - all responses already retrieved", async () => {
    adminDispatch({ type: REFRESH_STATE, state: clone(INPUT_STATE) });
    await adminDispatch(
      retrieveFullSurveyResponses(["surveyId1", "surveyId2"])
    );

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(DynamoDBClient).not.toHaveBeenCalled();
    expect(mockDynamodbClientSend).not.toHaveBeenCalled();
    expect(adminStore.getState().fullSurveyResponses).toStrictEqual(
      TEST_FULL_RESPONSES
    );
  });

  it("success - some responses already retrieved", async () => {
    adminDispatch({
      type: REFRESH_STATE,
      state: {
        ...clone(INPUT_STATE),
        fullSurveyResponses: { surveyId1: TEST_FULL_RESPONSE1 },
      },
    });
    await adminDispatch(
      retrieveFullSurveyResponses(["surveyId1", "surveyId2"])
    );

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(mockBatchGetItemCommand).toHaveBeenCalledTimes(1);
    expect(mockBatchGetItemCommand.mock.calls[0][0].RequestItems).toStrictEqual(
      {
        "dbtable-responses": {
          Keys: [{ id: { S: "surveyId2" } }],
        },
      }
    );
    expect(adminStore.getState().fullSurveyResponses).toStrictEqual(
      TEST_FULL_RESPONSES
    );
  });

  it("not signed in", async () => {
    adminDispatch({ type: REFRESH_STATE, state: clone(EMPTY_STATE) });
    await adminDispatch(
      retrieveFullSurveyResponses(["surveyId1", "surveyId2"])
    );

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(DynamoDBClient).not.toHaveBeenCalled();
    expect(mockDynamodbClientSend).not.toHaveBeenCalled();
    expect(adminStore.getState().fullSurveyResponses).toStrictEqual({});
  });

  it("error calling DynamoDB send", async () => {
    mockDynamodbClientSend.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await adminDispatch(
      retrieveFullSurveyResponses(["surveyId1", "surveyId2"])
    );

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(mockDynamodbClientSend).toHaveBeenCalledTimes(1);
    expect(adminStore.getState().fullSurveyResponses).toStrictEqual({});
  });
});

test("allSurveysRetrieved", () => {
  expect(
    allSurveysRetrieved(["key1", "key2"], {
      key1: TEST_FULL_RESPONSE1,
      key2: TEST_FULL_RESPONSE2,
    })
  ).toBe(true);
  expect(
    allSurveysRetrieved([], {
      key1: TEST_FULL_RESPONSE1,
      key2: TEST_FULL_RESPONSE2,
    })
  ).toBe(true);
  expect(allSurveysRetrieved([], {})).toBe(true);

  expect(
    allSurveysRetrieved(["key3"], {
      key1: TEST_FULL_RESPONSE1,
      key2: TEST_FULL_RESPONSE2,
    })
  ).toBe(false);
  expect(
    allSurveysRetrieved(["key1", "key3"], {
      key1: TEST_FULL_RESPONSE1,
      key2: TEST_FULL_RESPONSE2,
    })
  ).toBe(false);
  expect(allSurveysRetrieved(["key3"], {})).toBe(false);
});

const EMPTY_STATE: AdminStoreState = {
  surveyResponses: [],
  fullSurveyResponses: {},
  authState: SIGN_IN,
  errorMessage: "",
};

const SIGNEDIN_EMPTY_STATE: AdminStoreState = {
  surveyResponses: [],
  fullSurveyResponses: {},
  authState: SIGNED_IN,
  errorMessage: "",
  surveyUser: TEST_USER,
};

const TEST_FULL_RESPONSE1: SurveyResponse = {
  __typename: "SurveyResponse",
  createdAt: "2021-01-18T19:57:51.675Z",
  id: "surveyId1",
  responderEmail: "email1",
  responderName: "user1",
  schoolName: "school1",
  state: "Complete",
  surveyResponse: {
    play: {
      tyres: {
        answer: "d",
        comments: "test comment",
      },
    },
  },
  surveyVersion: "0.9.0",
  updatedAt: "2021-01-18T19:57:54.869Z",
};

const TEST_FULL_RESPONSE2: SurveyResponse = {
  __typename: "SurveyResponse",
  createdAt: "2021-02-18T19:57:51.675Z",
  id: "surveyId2",
  responderEmail: "email2",
  responderName: "user2",
  schoolName: "school2",
  state: "Complete",
  surveyResponse: {
    play: {
      tyres: {
        answer: "d",
        comments: "test comment2",
      },
    },
  },
  surveyVersion: "0.9.0",
  updatedAt: "2021-02-18T19:57:54.869Z",
};

const TEST_FULL_RESPONSE3: SurveyResponse = {
  __typename: "SurveyResponse",
  createdAt: "2021-02-18T19:57:51.675Z",
  id: "surveyId3",
  responderEmail: "email3",
  responderName: "user3",
  schoolName: "school3",
  state: "Complete",
  surveyResponse: {
    play: {
      tyres: {
        answer: "d",
        comments: "test comment3",
      },
    },
  },
  surveyVersion: "0.9.0",
  updatedAt: "2021-02-18T19:57:54.869Z",
};

const TEST_FULL_RESPONSE4: SurveyResponse = {
  __typename: "SurveyResponse",
  createdAt: "2021-02-18T19:57:51.675Z",
  id: "surveyId4",
  responderEmail: "email4",
  responderName: "user4",
  schoolName: "school4",
  state: "Complete",
  surveyResponse: {
    play: {
      tyres: {
        answer: "d",
        comments: "test comment4",
      },
    },
  },
  surveyVersion: "0.9.0",
  updatedAt: "2021-02-18T19:57:54.869Z",
};

const TEST_FULL_RESPONSES: Record<string, SurveyResponse> = {
  surveyId1: TEST_FULL_RESPONSE1,
  surveyId2: TEST_FULL_RESPONSE2,
};

const TEST_SUMMARY_RESPONSE1: SurveySummary = {
  createdAt: "2021-01-18T19:57:51.675Z",
  id: "surveyId1",
  responderEmail: "email1",
  responderName: "user1",
  schoolName: "school1",
  uploadState: "Complete",
  timestampString: "12th March, 2022",
};

const TEST_SUMMARY_RESPONSE2: SurveySummary = {
  createdAt: "2021-02-18T19:57:51.675Z",
  id: "surveyId2",
  responderEmail: "email2",
  responderName: "user2",
  schoolName: "school2",
  uploadState: "Complete",
  timestampString: "13th March, 2022",
};

const TEST_SUMMARY_RESPONSE3: SurveySummary = {
  createdAt: "2021-02-18T19:57:51.675Z",
  id: "surveyId3",
  responderEmail: "email3",
  responderName: "user3",
  schoolName: "school3",
  uploadState: "Complete",
  timestampString: "14th March, 2022",
};

const TEST_SUMMARY_RESPONSE4: SurveySummary = {
  createdAt: "2021-02-18T19:57:51.675Z",
  id: "surveyId4",
  responderEmail: "email4",
  responderName: "user4",
  schoolName: "school4",
  uploadState: "Complete",
  timestampString: "15th March, 2022",
};

const DB_FULL_RESPONSE = {
  Responses: {
    "dbtable-responses": [
      {
        responderName: { S: "user1" },
        __typename: { S: "SurveyResponse" },
        surveyResponse: {
          M: {
            play: {
              M: {
                tyres: {
                  M: { answer: { S: "d" }, comments: { S: "test comment" } },
                },
              },
            },
          },
        },
        responderEmail: { S: "email1" },
        updatedAt: { S: "2021-01-18T19:57:54.869Z" },
        schoolName: { S: "school1" },
        createdAt: { S: "2021-01-18T19:57:51.675Z" },
        surveyVersion: { S: "0.9.0" },
        id: { S: "surveyId1" },
        state: { S: "Complete" },
      },
      {
        responderName: { S: "user2" },
        __typename: { S: "SurveyResponse" },
        surveyResponse: {
          M: {
            play: {
              M: {
                tyres: {
                  M: { answer: { S: "d" }, comments: { S: "test comment2" } },
                },
              },
            },
          },
        },
        responderEmail: { S: "email2" },
        updatedAt: { S: "2021-02-18T19:57:54.869Z" },
        schoolName: { S: "school2" },
        createdAt: { S: "2021-02-18T19:57:51.675Z" },
        surveyVersion: { S: "0.9.0" },
        id: { S: "surveyId2" },
        state: { S: "Complete" },
      },
    ],
  },
  UnprocessedKeys: {},
};

const DB_INDEX_RESPONSE = {
  Count: 2,
  Items: [
    {
      responderName: { S: "user1" },
      schoolName: { S: "school1" },
      createdAt: { S: "2021-01-12T10:32:03.162Z" },
      id: { S: "surveyId1" },
      responderEmail: { S: "email1" },
    },
    {
      responderName: { S: "user2" },
      schoolName: { S: "school2" },
      createdAt: { S: "2021-02-12T10:32:03.162Z" },
      id: { S: "surveyId2" },
      responderEmail: { S: "email2" },
    },
  ],
  ScannedCount: 2,
};

const INPUT_STATE: AdminStoreState = {
  surveyResponses: [TEST_SUMMARY_RESPONSE1, TEST_SUMMARY_RESPONSE2],
  fullSurveyResponses: TEST_FULL_RESPONSES,
  errorMessage: "",
  authState: SIGNED_IN,
};

const STATE_WITH_AUTH_ERROR: AdminStoreState = {
  ...INPUT_STATE,
  errorMessage: "new error",
  surveyUser: TEST_USER,
  authState: SIGN_IN,
};

const STATE_WITHOUT_AUTH_ERROR: AdminStoreState = {
  ...INPUT_STATE,
  errorMessage: "",
  surveyUser: TEST_USER,
  authState: SIGN_IN,
};
