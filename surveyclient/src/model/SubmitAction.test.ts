/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSubmitStateCalls"] }] */
import { submitSurvey } from "./SubmitAction";
import { Auth } from "@aws-amplify/auth";
import axios from "axios";
import { INPUT_STATE } from "../model/TestUtils";
import {
  SUBMITTING_START,
  SUBMIT_COMPLETE,
  SUBMIT_FAILED,
} from "./SubmitStates";
import { surveyStore, SurveyStoreState } from "./SurveyModel";
import { REFRESH_STATE } from "./ActionTypes";
import { SurveyUser } from "learning-play-audit-shared";

const TEST_ENDPOINT = "http://localhost:9999/testEndpoint";

const FIXED_UUID = "00000000-0000-0000-0000-000000000000";
jest.mock("uuid", () => ({ v4: () => "00000000-0000-0000-0000-000000000000" }));

jest.mock("@aws-amplify/auth");
jest.mock("axios");

const setSubmitState = jest.fn();
const setProgressValue = jest.fn();

const mockPost = axios.post as jest.Mock;
const mockPut = axios.put as jest.Mock;

describe("submitSurvey", () => {
  beforeEach(() => {
    (Auth.currentSession as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        getIdToken: () => {
          return { getJwtToken: () => "test jwt token" };
        },
      });
    });
    mockPut.mockImplementation(() => Promise.resolve({ status: 200 }));
  });

  it("submit", async () => {
    const inputState = { ...INPUT_STATE };

    mockPost
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: SUBMIT_SURVEY_RESPONSE,
          status: 200,
        })
      );

    await submitSurvey(
      setSubmitState,
      setProgressValue,
      inputState,
      TEST_ENDPOINT
    );
    checkSubmitSurveyCalled(inputState, "test@example.com");
    checkSubmitStateCalls(
      SUBMITTING_START,
      SUBMIT_COMPLETE
    );
    checkProgressValueCalls(0, 100);
  });

  it("user.email not set", async () => {
    const inputState: SurveyStoreState = {
      ...INPUT_STATE,
      surveyUser: {} as SurveyUser,
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });

    await submitSurvey(
      setSubmitState,
      setProgressValue,
      inputState,
      TEST_ENDPOINT
    );
    expect(axios.post).not.toHaveBeenCalled();
    checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
    checkProgressValueCalls(0);
  });

  it("fail initial submit - non 200 response", async () => {
    mockPost.mockImplementationOnce(() =>
      Promise.resolve({
        data: { message: "Failure in test" },
        status: 403,
      })
    );

    await submitSurvey(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    );
    checkSubmitSurveyCalled(INPUT_STATE, "test@example.com");
    checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
    checkProgressValueCalls(0);
  });

  it("fail initial submit - axios error", async () => {
    mockPost.mockImplementationOnce(() =>
      Promise.reject(
        new Error(
          JSON.stringify({
            data: { message: "Failure in test" },
            status: 403,
          })
        )
      )
    );

    await submitSurvey(
      setSubmitState,
      setProgressValue,
      INPUT_STATE,
      TEST_ENDPOINT
    );
    checkSubmitSurveyCalled(INPUT_STATE, "test@example.com");
    checkSubmitStateCalls(SUBMITTING_START, SUBMIT_FAILED);
    checkProgressValueCalls(0);
  });

  function checkSubmitSurveyCalled({ answers, surveyVersion }: SurveyStoreState, email: string) {
    // Email is added to answers
    const expectedAnswers = { ...answers };
    expectedAnswers.background = { ...answers.background, email: { answer: email, comments: "" } };

    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      "/survey",
      JSON.stringify({
        uuid: FIXED_UUID,
        survey: expectedAnswers,
        surveyVersion,
      }),
      {
        "baseURL": "http://localhost:9999/testEndpoint",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: "Bearer test jwt token",
        },
      }
    );
  }

  function checkSubmitStateCalls(...expectedValues: string[]) {
    expect(setSubmitState).toHaveBeenCalledTimes(expectedValues.length);
    expectedValues.forEach((expectedValue, i) => {
      expect(setSubmitState).toHaveBeenNthCalledWith(i + 1, expectedValue);
    });
  }

  function checkProgressValueCalls(...expectedValues: number[]) {
    expect(setProgressValue).toHaveBeenCalledTimes(expectedValues.length);
    expectedValues.forEach((expectedValue, i) => {
      expect(setProgressValue).toHaveBeenNthCalledWith(i + 1, expectedValue);
    });
  }

  const SUBMIT_SURVEY_RESPONSE = { result: "Submission complete" };
});
