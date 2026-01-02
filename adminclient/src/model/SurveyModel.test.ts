import {
  adminStore,
  surveyReducer,
  retrieveSummaryResponses,
  retrieveFullSurveyResponses,
  getPhotoKeysForSurveys,
  retrievePhotosForSurveys,
  getPhotoUrl,
  allSurveysRetrieved,
  objectResponseToUint8Array,
  AdminStoreState,
  Photo,
  SurveyResponse,
  SurveySummary,
} from "./SurveyModel";
import {
  REFRESH_STATE,
  SET_SUMMARY_RESPONSES,
  SET_FULL_RESPONSES,
  SET_PHOTOS,
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
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createRequest } from "@aws-sdk/util-create-request";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { formatUrl } from "@aws-sdk/util-format-url";
import { ReadableStream } from "web-streams-polyfill/ponyfill";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

jest.mock("@aws-amplify/auth");
jest.mock("@aws-sdk/client-dynamodb");
jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/util-create-request");
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("@aws-sdk/util-format-url");

const mockDynamodbClientSend = jest.fn();
const mockS3ClientSend = jest.fn();

const mockGetObjectCommand = GetObjectCommand as jest.Mock;
const mockFormatUrl = formatUrl as jest.Mock;
const mockCreateRequest = createRequest as jest.Mock;
const mockS3RequestPresigner = S3RequestPresigner as jest.Mock;
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
  (S3Client as jest.Mock).mockImplementation(() => {
    return { send: mockS3ClientSend };
  });

  mockDynamodbClientSend.mockReset();
  mockS3ClientSend.mockReset();
});

const clone = rfdc();

const PHOTOS_BUCKET = "bucket-surveyresources";
const DB_TABLE = "dbtable-responses";
const DB_TABLE_INDEX = "dbtable-index-responses";

process.env.REACT_APP_AWS_REGION = "eu-west-2";
process.env.REACT_APP_AWS_SURVEY_RESOURCES_S3_BUCKET = PHOTOS_BUCKET;
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

  it("action SET_PHOTOS", () => {
    const photo1 = { key: "1", data: Uint8Array.from([1]) };
    const photo2 = { key: "2", data: Uint8Array.from([2]) };
    const photo3 = { key: "3", data: Uint8Array.from([3]) };
    const newPhoto2 = { key: "2", data: Uint8Array.from([4]) };

    expect(
      surveyReducer(
        { ...EMPTY_STATE, photos: {} },
        { type: SET_PHOTOS, photos: { "1": photo1, "2": photo2 } }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      photos: { "1": photo1, "2": photo2 },
    });

    expect(
      surveyReducer(
        {
          ...EMPTY_STATE,
          photos: { "2": photo2, "3": photo3 },
        },
        {
          type: SET_PHOTOS,
          photos: { "1": photo1, "2": newPhoto2 },
        }
      )
    ).toStrictEqual({
      ...EMPTY_STATE,
      photos: { "1": photo1, "2": newPhoto2, "3": photo3 },
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

describe("getPhotoKeysForSurveys", () => {
  it("success", async () => {
    expect(
      getPhotoKeysForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    ).toStrictEqual([
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ]);

    expect(
      getPhotoKeysForSurveys([SURVEY_WITHOUT_PHOTOS, SURVEY_WITHOUT_PHOTOS])
    ).toStrictEqual([]);

    expect(getPhotoKeysForSurveys([])).toStrictEqual([]);
  });
});

describe("retrievePhotosForSurveys", () => {
  beforeEach(() => {
    adminDispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    function getLastGetObjectCommandKey() {
      return mockGetObjectCommand.mock.calls[
        mockGetObjectCommand.mock.calls.length - 1
      ][0].Key;
    }

    function s3PhotoResponse(key: string) {
      return { Body: arrayToReadableStream(IMAGE_DATA, key) };
    }

    mockS3ClientSend.mockImplementation(() => {
      return Promise.resolve(s3PhotoResponse(getLastGetObjectCommandKey()));
    });
  });

  it("success - empty existing photos", async () => {
    await adminDispatch(
      retrievePhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(mockS3ClientSend).toHaveBeenCalledTimes(2);

    const expectedPhotoKeys = [
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ];
    checkGetObjectCommands(expectedPhotoKeys);
    checkStoredPhotos(expectedPhotoKeys);
  });

  it("success - all photos already retrieved", async () => {
    adminDispatch({
      type: REFRESH_STATE,
      state: {
        ...clone(INPUT_STATE),
        photos: {
          "surveys/surveyId1/photos/photoId1": {
            data: imageDataToUint8Array(
              IMAGE_DATA,
              "surveys/surveyId1/photos/photoId1"
            ),
            key: "surveys/surveyId1/photos/photoId1",
          },
          "surveys/surveyId2/photos/photoId2": {
            data: imageDataToUint8Array(
              IMAGE_DATA,
              "surveys/surveyId2/photos/photoId2"
            ),
            key: "surveys/surveyId2/photos/photoId2",
          },
        },
      },
    });
    await adminDispatch(
      retrievePhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(S3Client).not.toHaveBeenCalled();
    expect(mockS3ClientSend).not.toHaveBeenCalled();
    expect(mockGetObjectCommand).not.toHaveBeenCalled();
    checkStoredPhotos([
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ]);
  });

  it("success - some photos already retrieved", async () => {
    adminDispatch({
      type: REFRESH_STATE,
      state: {
        ...clone(INPUT_STATE),
        photos: {
          "surveys/surveyId1/photos/photoId1": {
            data: imageDataToUint8Array(
              IMAGE_DATA,
              "surveys/surveyId1/photos/photoId1"
            ),
            key: "surveys/surveyId1/photos/photoId1",
          },
        },
      },
    });
    await adminDispatch(
      retrievePhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(mockS3ClientSend).toHaveBeenCalledTimes(1);
    checkGetObjectCommands(["surveys/surveyId2/photos/photoId2"]);
    checkStoredPhotos([
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ]);
  });

  it("not signed in", async () => {
    adminDispatch({ type: REFRESH_STATE, state: clone(EMPTY_STATE) });
    await adminDispatch(
      retrievePhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).not.toHaveBeenCalled();
    expect(S3Client).not.toHaveBeenCalled();
    expect(mockS3ClientSend).not.toHaveBeenCalled();
    expect(mockGetObjectCommand).not.toHaveBeenCalled();
    expect(adminStore.getState().photos).toStrictEqual({});
  });

  it("error calling S3 send send", async () => {
    mockS3ClientSend.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await adminDispatch(
      retrievePhotosForSurveys([
        TEST_FULL_RESPONSE1,
        TEST_FULL_RESPONSE2,
        SURVEY_WITHOUT_PHOTOS,
      ])
    );

    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(mockS3ClientSend).toHaveBeenCalledTimes(2);
    checkGetObjectCommands([
      "surveys/surveyId1/photos/photoId1",
      "surveys/surveyId2/photos/photoId2",
    ]);
    expect(adminStore.getState().photos).toStrictEqual({
      "surveys/surveyId1/photos/photoId1": {
        error: "[Image not found]",
        key: "surveys/surveyId1/photos/photoId1",
      },
      "surveys/surveyId2/photos/photoId2": {
        error: "[Image not found]",
        key: "surveys/surveyId2/photos/photoId2",
      },
    });
  });
});

describe("getPhotoUrl", () => {
  const mockS3RequestPresignerPresign = jest.fn();

  beforeEach(() => {
    adminDispatch({
      type: REFRESH_STATE,
      state: clone(SIGNEDIN_EMPTY_STATE),
    });

    mockCreateRequest.mockImplementation(() =>
      Promise.resolve("created request")
    );
    mockS3RequestPresignerPresign.mockReset();
    mockS3RequestPresignerPresign.mockImplementation(() =>
      Promise.resolve("presigned request")
    );
    mockFormatUrl.mockImplementation(() => "formatted request");

    mockS3RequestPresigner.mockImplementation(() => {
      return { presign: mockS3RequestPresignerPresign };
    });
  });

  it("success", async () => {
    const url = await getPhotoUrl("testKey");

    // Lots of mocking means the test is only checking the promise wiring
    expect(Auth.currentCredentials).toHaveBeenCalledTimes(1);
    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(mockCreateRequest).toHaveBeenCalledTimes(1);
    expect(mockGetObjectCommand).toHaveBeenCalledTimes(1);
    expect(mockGetObjectCommand.mock.calls[0][0]).toStrictEqual({
      Bucket: "bucket-surveyresources",
      Key: "testKey",
    });
    expect(mockS3RequestPresigner).toHaveBeenCalledTimes(1);
    expect(mockS3RequestPresignerPresign).toHaveBeenCalledTimes(1);
    expect(mockS3RequestPresignerPresign.mock.calls[0][0]).toBe(
      "created request"
    );
    expect(mockFormatUrl).toHaveBeenCalledTimes(1);
    expect(mockFormatUrl.mock.calls[0][0]).toBe("presigned request");

    expect(url).toBe("formatted request");
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

// The first 48 bytes of a Jpeg
// prettier-ignore
const IMAGE_DATA = [
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    0x00, 0x60, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
    0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12];

describe("objectResponseToUint8Array", () => {
  it("input readableStream", async () => {
    const readStream = arrayToReadableStream(IMAGE_DATA);
    const expectedData = new Uint8Array(IMAGE_DATA);
    return objectResponseToUint8Array(readStream).then((output) =>
      expect(output).toStrictEqual(expectedData)
    );
  });

  it("empty readableStream", async () => {
    const readStream = arrayToReadableStream([]);
    const expectedData = new Uint8Array([]);
    return objectResponseToUint8Array(readStream).then((output) =>
      expect(output).toStrictEqual(expectedData)
    );
  });

  it("input blob", async () => {
    const blob = new Blob([imageDataToUint8Array(IMAGE_DATA)]);
    const expectedData = new Uint8Array(IMAGE_DATA);
    return objectResponseToUint8Array(blob).then((output) =>
      expect(output).toStrictEqual(expectedData)
    );
  });

  it("empty blob", async () => {
    const blob = new Blob([]);
    const expectedData = new Uint8Array([]);
    return objectResponseToUint8Array(blob).then((output) =>
      expect(output).toStrictEqual(expectedData)
    );
  });
});

function imageDataToUint8Array(data: number[], textSuffix?: string) {
  const textCharCodes = textSuffix
    ? Array.from(textSuffix).map((char) => char.charCodeAt(0))
    : [];
  return new Uint8Array([...data, ...textCharCodes]);
}

function arrayToReadableStream(data: number[], textSuffix?: string) {
  return new ReadableStream({
    start(controller) {
      const array = imageDataToUint8Array(data, textSuffix);
      if (array.length > 0) {
        controller.enqueue(imageDataToUint8Array(data, textSuffix));
      }
      controller.close();
    },
    type: "bytes",
  });
}

function checkGetObjectCommands(expectedPhotoKeys: string[]) {
  expect(mockGetObjectCommand).toHaveBeenCalledTimes(expectedPhotoKeys.length);

  expectedPhotoKeys.forEach((key, i) => {
    expect(mockGetObjectCommand.mock.calls[i][0]).toStrictEqual({
      Bucket: "bucket-surveyresources",
      Key: key,
    });
  });
}

function checkStoredPhotos(expectedPhotoKeys: string[]) {
  const expectedPhotos: Record<string, Photo> = {};
  expectedPhotoKeys.forEach((key) => {
    expectedPhotos[key] = {
      data: imageDataToUint8Array(IMAGE_DATA, key),
      key,
    };
  });
  expect(adminStore.getState().photos).toStrictEqual(expectedPhotos);
}

const EMPTY_STATE: AdminStoreState = {
  surveyResponses: [],
  fullSurveyResponses: {},
  photos: {},
  authState: SIGN_IN,
  errorMessage: "",
};

const SIGNEDIN_EMPTY_STATE: AdminStoreState = {
  surveyResponses: [],
  fullSurveyResponses: {},
  photos: {},
  authState: SIGNED_IN,
  errorMessage: "",
  surveyUser: TEST_USER,
};

const TEST_FULL_RESPONSE1: SurveyResponse = {
  __typename: "SurveyResponse",
  createdAt: "2021-01-18T19:57:51.675Z",
  id: "surveyId1",
  photos: [
    {
      bucket: "bucket-surveyresources",
      description: "photo description",
      fullsize: {
        height: 300,
        key: "surveys/surveyId1/photos/photoId1",
        uploadKey: null,
        width: 400,
      },
    },
  ],
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
  photos: [
    {
      bucket: "bucket-surveyresources",
      description: "photo description2",
      fullsize: {
        height: 300,
        key: "surveys/surveyId2/photos/photoId2",
        uploadKey: null,
        width: 400,
      },
    },
  ],
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
  photos: [
    {
      bucket: "bucket-surveyresources",
      description: "photo description3",
      fullsize: {
        height: 300,
        key: "surveys/surveyId3/photos/photoId3",
        uploadKey: null,
        width: 400,
      },
    },
  ],
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
  photos: [
    {
      bucket: "bucket-surveyresources",
      description: "photo description4",
      fullsize: {
        height: 300,
        key: "surveys/surveyId4/photos/photoId4",
        uploadKey: null,
        width: 400,
      },
    },
  ],
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

const SURVEY_WITHOUT_PHOTOS: SurveyResponse = {
  __typename: "SurveyResponse",
  createdAt: "2021-02-18T19:57:51.675Z",
  id: "surveyId3",
  photos: [],
  surveyResponse: {
    play: {
      tyres: {
        answer: "d",
        comments: "test comment",
      },
    },
  },
  responderEmail: "email4",
  responderName: "user4",
  schoolName: "school4",
  state: "Complete",
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
        photos: {
          L: [
            {
              M: {
                bucket: { S: PHOTOS_BUCKET },
                fullsize: {
                  M: {
                    width: { N: "400" },
                    uploadKey: { NULL: true },
                    key: { S: "surveys/surveyId1/photos/photoId1" },
                    height: { N: "300" },
                  },
                },
                description: { S: "photo description" },
              },
            },
          ],
        },
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
        photos: {
          L: [
            {
              M: {
                bucket: { S: PHOTOS_BUCKET },
                fullsize: {
                  M: {
                    width: { N: "400" },
                    uploadKey: { NULL: true },
                    key: { S: "surveys/surveyId2/photos/photoId2" },
                    height: { N: "300" },
                  },
                },
                description: { S: "photo description2" },
              },
            },
          ],
        },
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

const PHOTO_1 = { key: "1", data: Uint8Array.from([1]) };
const PHOTO_2 = { key: "2", data: Uint8Array.from([1]) };

const INPUT_STATE: AdminStoreState = {
  surveyResponses: [TEST_SUMMARY_RESPONSE1, TEST_SUMMARY_RESPONSE2],
  fullSurveyResponses: TEST_FULL_RESPONSES,
  photos: { "1": PHOTO_1, "2": PHOTO_2 },
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
