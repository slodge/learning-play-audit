import { createStore, applyMiddleware, AnyAction } from "redux";
import thunk, { ThunkAction } from "redux-thunk";
import {
  SET_SUMMARY_RESPONSES,
  SET_FULL_RESPONSES,
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

// Configure these properties in .env.local
const REGION = process.env.REACT_APP_AWS_REGION!;
const SURVEY_RESPONSES_TABLE =
  process.env.REACT_APP_AWS_SURVEY_RESPONSES_TABLE!;
const SURVEY_RESPONSES_SUMMARY_INDEX =
  process.env.REACT_APP_AWS_SURVEY_RESPONSES_SUMMARY_INDEX!;

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

export interface AdminStoreState extends AuthStoreState {
  surveyResponses: SurveySummary[];
  fullSurveyResponses: Record<string, SurveyResponse>;
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
