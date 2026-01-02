import { createStore, applyMiddleware, AnyAction } from "redux";
import thunk, { ThunkAction } from "redux-thunk";
import {
  SET_SUMMARY_RESPONSES,
  SET_FULL_RESPONSES,
  SET_PHOTOS,
  REFRESH_STATE,
} from "./ActionTypes";
import {
  authReducer,
  SIGN_IN,
  SIGNED_IN,
  AuthStoreState,
} from "learning-play-audit-shared";
import { Auth } from "@aws-amplify/auth";
import {
  DynamoDBClient,
  ScanCommand,
  BatchGetItemCommand,
  BatchGetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  S3Client,
  GetObjectCommand,
  GetObjectOutput,
} from "@aws-sdk/client-s3";
import { createRequest } from "@aws-sdk/util-create-request";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { formatUrl } from "@aws-sdk/util-format-url";

// Configure these properties in .env.local
const REGION = process.env.REACT_APP_AWS_REGION!;
const SURVEY_RESOURCES_S3_BUCKET =
  process.env.REACT_APP_AWS_SURVEY_RESOURCES_S3_BUCKET!;
const SURVEY_RESPONSES_TABLE =
  process.env.REACT_APP_AWS_SURVEY_RESPONSES_TABLE!;
const SURVEY_RESPONSES_SUMMARY_INDEX =
  process.env.REACT_APP_AWS_SURVEY_RESPONSES_SUMMARY_INDEX!;

const IMAGE_NOT_FOUND = "[Image not found]";

export interface PhotoDetails {
  bucket: string;
  description: string;
  fullsize: {
    height: number;
    key: string;
    uploadKey: string | null;
    width: number;
  };
}
export type QuestionAnswer = {
  answer: string;
  comments: string;
};

export type DatedQuestionAnswer = {
  answer1: string;
  year1: string;
  answer2: string;
  year2: string;
  answer3: string;
  year3: string;
};

export type QuestionAnswerKey = keyof QuestionAnswer;
export type DatedQuestionAnswerKey = keyof DatedQuestionAnswer;

export type SectionAnswers = Record<
  string,
  QuestionAnswer | DatedQuestionAnswer
>;

export type SurveyAnswers = Record<string, SectionAnswers>;

export interface SurveyResponse {
  __typename: "SurveyResponse";
  createdAt: string;
  id: string;
  photos: PhotoDetails[];
  responderEmail: string;
  responderName: string;
  schoolName: string;
  state: string;
  surveyResponse: SurveyAnswers;
  surveyVersion: string;
  updatedAt: string;
}

export interface SurveySummary {
  id: string;
  createdAt: string;
  responderEmail: string;
  responderName: string;
  schoolName: string;
  uploadState: string;
  timestampString: string;
}

export interface Photo {
  key: string;
  data: Uint8Array;
}

export interface AdminStoreState extends AuthStoreState {
  surveyResponses: SurveySummary[];
  fullSurveyResponses: Record<string, SurveyResponse>;
  photos: Record<string, Photo>;
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AdminStoreState,
  unknown,
  AnyAction
>;

function initialState(): AdminStoreState {
  console.debug("Setting initialState");
  return {
    surveyResponses: [],
    fullSurveyResponses: {},
    photos: {},
    authState: SIGN_IN,
    errorMessage: "",
  };
}

// Exported for unit tests only
function surveyAnswersReducer(
  state: AdminStoreState,
  action: AnyAction
): AdminStoreState {
  switch (action.type) {
    case SET_SUMMARY_RESPONSES:
      console.debug("SET_SUMMARY_RESPONSES", action);
      return { ...state, surveyResponses: action.responses };

    case SET_FULL_RESPONSES:
      console.debug("SET_FULL_RESPONSES", action);
      return {
        ...state,
        fullSurveyResponses: {
          ...state.fullSurveyResponses,
          ...action.responses,
        },
      };

    case SET_PHOTOS:
      console.debug("SET_PHOTOS", action);
      return {
        ...state,
        photos: { ...state.photos, ...action.photos },
      };

    case REFRESH_STATE:
      console.debug("REFRESH_STATE", action.state);
      return action.state;

    default:
      console.debug("Unknown action: ", action);
      return state;
  }
}

export function retrieveSummaryResponses(): AppThunk {
  console.debug("retrieveSummaryResponses");
  return function (dispatch, getState) {
    if (getState().authState !== SIGNED_IN) {
      console.error("User not signed in");
      return Promise.resolve("User not signed in");
    }

    return Auth.currentCredentials()
      .then((credentials) => {
        const dynamodbClient = new DynamoDBClient({
          region: REGION,
          credentials,
        });
        const params = {
          TableName: SURVEY_RESPONSES_TABLE,
          IndexName: SURVEY_RESPONSES_SUMMARY_INDEX,
          ReturnConsumedCapacity: "TOTAL",
        };
        console.debug("Scanning data", params);
        return dynamodbClient.send(new ScanCommand(params));
      })
      .then((result) => {
        dispatch({
          type: SET_SUMMARY_RESPONSES,
          responses: result.Items!.map((item) => {
            const unmarshalledResult = unmarshall(item) as SurveySummary;
            // Add localised timestamp
            // format string as yyyy/mm/dd HH:MM:SS in order to make the text sortable
            unmarshalledResult.timestampString = new Date(
              unmarshalledResult.createdAt
            ).toLocaleString("en-CA", { timeZone: "UTC" });
            return unmarshalledResult;
          }),
        });
      })
      .catch((error) => {
        console.log("Error retrieving data", error);
        return Promise.resolve();
      });
  };
}

export function retrieveFullSurveyResponses(surveyIds: string[]): AppThunk {
  console.debug("retrieveFullSurveyResponses", surveyIds);
  return function (dispatch, getState) {
    if (getState().authState !== SIGNED_IN) {
      console.error("User not signed in");
      return Promise.resolve("User not signed in");
    }

    const surveyIdsToRetrieve = getSurveyIdsToRetrieve(
      surveyIds,
      getState().fullSurveyResponses
    );
    if (surveyIdsToRetrieve.length === 0) {
      console.log("no full responses to retrieve");
      return Promise.resolve();
    }

    return Auth.currentCredentials()
      .then((credentials) => {
        const dynamodbClient = new DynamoDBClient({
          region: REGION,
          credentials,
        });
        const params: BatchGetItemCommandInput = {
          RequestItems: {},
          ReturnConsumedCapacity: "TOTAL",
        };
        params.RequestItems![SURVEY_RESPONSES_TABLE] = {
          Keys: surveyIdsToRetrieve.map((id) => {
            return { id: { S: id } };
          }),
        };
        console.debug("Retrieving full responses data", params);
        return dynamodbClient.send(new BatchGetItemCommand(params));
      })
      .then((result) => {
        const retrievedResponses = result.Responses![
          SURVEY_RESPONSES_TABLE
        ].map((item) => unmarshall(item));
        const responsesMap = retrievedResponses.reduce((acc, response) => {
          acc[response.id] = response;
          return acc;
        }, {});
        dispatch({
          type: SET_FULL_RESPONSES,
          responses: responsesMap,
        });
      })
      .catch((error) => {
        console.log("User not logged in", error);
        return Promise.resolve();
      });
  };
}

export function retrievePhotosForSurveys(surveys: SurveyResponse[]) {
  console.debug("retrievePhotosForSurveys", surveys);
  return retrievePhotos(getPhotoKeysForSurveys(surveys));
}

export function getPhotoKeysForSurveys(surveys: SurveyResponse[]) {
  console.debug("getPhotoKeysForSurveys", surveys);
  return surveys
    .filter((survey) => survey.photos.length > 0)
    .map((survey) => survey.photos.map((photo) => photo.fullsize.key))
    .flat();
}

function retrievePhotos(photoKeys: string[]): AppThunk {
  console.debug("getPhretrievePhotosotos", photoKeys);
  return function (dispatch, getState) {
    if (getState().authState !== SIGNED_IN) {
      console.error("User not signed in");
      return Promise.resolve("User not signed in");
    }

    const existingPhotos = getState().photos;
    const remainingPhotoKeys = photoKeys.filter(
      (photoKey) => !existingPhotos.hasOwnProperty(photoKey)
    );

    if (remainingPhotoKeys.length === 0) {
      console.debug("All photos already retrieved");
      return Promise.resolve();
    }

    return Auth.currentCredentials()
      .then((credentials) => {
        const s3 = new S3Client({ region: REGION, credentials });
        return Promise.allSettled(
          remainingPhotoKeys.map((photoKey) => getPhoto(s3, photoKey))
        );
      })
      .then((photodata) => {
        const photosMap = photodata
          .map((item) => (item as PromiseFulfilledResult<Photo>).value)
          .reduce((acc, photo: Photo) => {
            acc[photo.key] = photo;
            return acc;
          }, {} as Record<string, Photo>);

        dispatch({
          type: SET_PHOTOS,
          photos: photosMap,
        });
      });
  };
}

function getPhoto(s3: S3Client, photoKey: string) {
  return s3
    .send(
      new GetObjectCommand({
        Bucket: SURVEY_RESOURCES_S3_BUCKET,
        Key: photoKey,
      })
    )
    .then((photoData: GetObjectOutput) =>
      objectResponseToUint8Array(photoData.Body! as ReadableStream | Blob)
    )
    .then((array: Uint8Array) =>
      Promise.resolve({ key: photoKey, data: array })
    )
    .catch((error: Error) => {
      console.error("Error retrieving photo", photoKey, error);
      return Promise.resolve({ key: photoKey, error: IMAGE_NOT_FOUND });
    });
}

// Exported for unit tests
export function objectResponseToUint8Array(
  responseBody: ReadableStream | Blob
) {
  if (typeof Blob === "function" && responseBody instanceof Blob) {
    return new Promise<ArrayBuffer>(function (resolve) {
      var fileReader = new FileReader();

      fileReader.onloadend = function () {
        resolve(fileReader.result as ArrayBuffer);
      };

      fileReader.readAsArrayBuffer(responseBody);
    }).then((arrayBuffer) => Promise.resolve(new Uint8Array(arrayBuffer)));
  }

  const INITIAL_BUFFER_SIZE = 1024;
  let buffer = new Uint8Array(INITIAL_BUFFER_SIZE);
  let bytesUsed = 0;

  const reader = (responseBody as ReadableStream).getReader();
  async function readStream() {
    let isDone = false;
    while (!isDone) {
      const { done, value } = await reader.read();
      if (value) {
        if (value.length + bytesUsed > buffer.byteLength) {
          let oldBuffer = buffer;
          var newSize = Math.max(
            buffer.byteLength * 2,
            value.length + bytesUsed + 1
          );
          buffer = new Uint8Array(newSize);
          buffer.set(oldBuffer);
        }

        buffer.set(value, bytesUsed);
        bytesUsed += value.length;
      }
      isDone = done;
    }
  }
  return readStream().then(() =>
    Promise.resolve(buffer.subarray(0, bytesUsed))
  );
}

export function getPhotoUrl(photoKey: string): Promise<string> {
  let s3: S3Client;
  return Auth.currentCredentials()
    .then((credentials) => {
      s3 = new S3Client({ region: REGION, credentials });
      return createRequest(
        s3,
        new GetObjectCommand({
          Bucket: SURVEY_RESOURCES_S3_BUCKET,
          Key: photoKey,
        })
      );
    })
    .then((request) => {
      const signer = new S3RequestPresigner({ ...s3.config });
      return signer.presign(request, { expiresIn: 900 });
    })
    .then((presignedRequest) => Promise.resolve(formatUrl(presignedRequest)));
}

function getSurveyIdsToRetrieve(
  selectedSurveyIds: string[],
  fullSurveyResponses: Record<string, SurveyResponse>
) {
  return selectedSurveyIds.filter(
    (surveyId) => !fullSurveyResponses.hasOwnProperty(surveyId)
  );
}

export function allSurveysRetrieved(
  selectedSurveyIds: string[],
  fullSurveyResponses: Record<string, SurveyResponse>
) {
  return (
    getSurveyIdsToRetrieve(selectedSurveyIds, fullSurveyResponses).length === 0
  );
}

// Exported for unit tests
export function surveyReducer(
  state = initialState(),
  action = {} as AnyAction
) {
  return surveyAnswersReducer(
    authReducer(state, action) as AdminStoreState,
    action
  );
}

export const adminStore = createStore(surveyReducer, applyMiddleware(thunk));

export function getSummaryResponses(state: AdminStoreState) {
  return state.surveyResponses;
}

export function getFullSurveyResponses(state: AdminStoreState) {
  return state.fullSurveyResponses;
}

export function getPhotos(state: AdminStoreState) {
  return state.photos;
}
