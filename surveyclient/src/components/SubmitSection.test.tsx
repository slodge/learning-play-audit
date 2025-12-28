import React from "react";
import { uploadResults } from "../model/SubmitAction";
import SubmitSection from "./SubmitSection";
import { surveyStore, SurveyStoreState } from "../model/SurveyModel";
import { REFRESH_STATE } from "../model/ActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  signOut,
  authReducer,
} from "learning-play-audit-shared";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";
import {
  SUBMITTING_START,
  SUBMITTING_PHOTOS,
  SUBMITTING_CONFIRM,
  SUBMIT_COMPLETE,
  SUBMIT_FAILED,
} from "../model/SubmitStates";
import { renderWithStore } from "./ReactTestUtils";
import { GALLERY, RESULTS, SUBMIT } from "../model/SurveySections";
import { waitFor } from "@testing-library/dom";

const TEST_ENDPOINT = "http://localhost:9999/testEndpoint";

jest.mock("learning-play-audit-shared", () => {
  const originalShared = jest.requireActual("learning-play-audit-shared");
  return { ...originalShared, signOut: jest.fn(), authReducer: jest.fn() };
});
jest.mock("../model/SubmitAction");

const TEST_STATE: SurveyStoreState = {
  ...INPUT_STATE,
  authState: SIGNED_IN,
  surveyUser: { email: "test@example.com" },
  currentSectionId: SUBMIT,
};

describe("component SubmitSection", () => {
  beforeEach(() => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: TEST_STATE });

    (authReducer as jest.Mock).mockImplementation((state) => state);

    (signOut as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("initial state logged in", () => {
    renderWithStore(<SubmitSection endpoint={TEST_ENDPOINT} />);

    expect(sectionContent()).toHaveTextContent("UPLOAD…");
  });

  it("initial state not logged in", () => {
    const inputState: SurveyStoreState = {
      ...INPUT_STATE,
      authState: SIGN_IN,
      surveyUser: undefined,
      currentSectionId: SUBMIT,
    };

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    renderWithStore(<SubmitSection endpoint={TEST_ENDPOINT} />);

    expect(sectionContent()).toHaveTextContent(
      "Login before submitting survey."
    );
  });

  it("bottom navigation", async () => {
    const { getByRole, user } = renderWithStore(
      <SubmitSection endpoint={TEST_ENDPOINT} />
    );

    await user.click(getByRole("button", { name: "previous section" }));
    //expect(surveyStore.getState().currentSectionId).toBe(GALLERY);
    expect(surveyStore.getState().currentSectionId).toBe(RESULTS);
  });

  it("confirm dialog appears", async () => {
    const { user } = renderWithStore(
      <SubmitSection endpoint={TEST_ENDPOINT} />
    );
    expect(confirmYesButton()).toBeNull();

    await user.click(uploadButton());
    expect(confirmYesButton()).not.toBeNull();
  });

  it("confirm upload cancel", async () => {
    const { user } = renderWithStore(
      <SubmitSection endpoint={TEST_ENDPOINT} />
    );
    await user.click(uploadButton());

    await user.click(confirmNoButton()!);

    expect(confirmYesButton()).toBeNull();
    expect(uploadResults).not.toHaveBeenCalled();
  });

  it("confirm upload cancel click background", async () => {
    const { user } = renderWithStore(
      <SubmitSection endpoint={TEST_ENDPOINT} />
    );
    await user.click(uploadButton());

    const backdrop = document.querySelector(
      "#dialog-container div:first-child"
    )!;
    await user.click(backdrop);

    expect(confirmYesButton()).toBeNull();
    expect(uploadResults).not.toHaveBeenCalled();
  });

  it("upload success and close", async () => {
    const { user } = renderWithStore(
      <SubmitSection endpoint={TEST_ENDPOINT} />
    );
    expect(uploadResults).toHaveBeenCalledTimes(0);
    await user.click(uploadButton());
    await user.click(confirmYesButton()!);

    const { setSubmitState, setProgressValue } = checkUploadAndGetCallbacks(
      TEST_STATE,
      TEST_ENDPOINT
    );

    setSubmitState(SUBMIT_COMPLETE);
    setProgressValue(100);

    await checkDialogComplete();

    await user.click(closeButton()!);

    expect(dialog()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual({
      ...EMPTY_STATE,
      initialisingState: false,
    });
  });

  it("upload failure and close", async () => {
    const { user } = renderWithStore(
      <SubmitSection endpoint={TEST_ENDPOINT} />
    );
    expect(uploadResults).toHaveBeenCalledTimes(0);
    await user.click(uploadButton());
    await user.click(confirmYesButton()!);

    const { setSubmitState, setProgressValue } = checkUploadAndGetCallbacks(
      TEST_STATE,
      TEST_ENDPOINT
    );

    setSubmitState(SUBMIT_FAILED);
    setProgressValue(50);

    await checkDialogFailed("50%");

    await user.click(closeButton()!);

    expect(dialog()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual(TEST_STATE);
  });

  it("progress changes during upload", async () => {
    const { user } = renderWithStore(
      <SubmitSection endpoint={TEST_ENDPOINT} />
    );
    expect(uploadResults).toHaveBeenCalledTimes(0);
    await user.click(uploadButton());
    await user.click(confirmYesButton()!);

    const { setSubmitState, setProgressValue } = checkUploadAndGetCallbacks(
      TEST_STATE,
      TEST_ENDPOINT
    );

    // Test progress updates
    setSubmitState(SUBMITTING_START);
    setProgressValue(0);
    await checkDialogInProgress("0%", "Uploading survey response");

    setSubmitState(SUBMITTING_PHOTOS);
    setProgressValue(20);
    await checkDialogInProgress("20%", "Uploading photos");

    setProgressValue(40);
    await checkDialogInProgress("40%", "Uploading photos");

    setProgressValue(60);
    await checkDialogInProgress("60%", "Uploading photos");

    setSubmitState(SUBMITTING_CONFIRM);
    setProgressValue(80);
    await checkDialogInProgress("80%", "Confirming upload");

    setSubmitState(SUBMIT_COMPLETE);
    setProgressValue(100);
    await checkDialogComplete();
  });

  interface UploadCallbacks {
    setSubmitState: (state: string) => void;
    setProgressValue: (value: number) => void;
  }

  function checkUploadAndGetCallbacks(
    expectedState: SurveyStoreState,
    expectedEndpoint: string
  ): UploadCallbacks {
    expect(uploadResults).toHaveBeenCalledTimes(1);
    const calls = (uploadResults as jest.Mock).mock.calls;
    expect(calls[0]).toHaveLength(4);
    expect(calls[0][2]).toStrictEqual(expectedState);
    expect(calls[0][3]).toStrictEqual(expectedEndpoint);
    return {
      setSubmitState: calls[0][0],
      setProgressValue: calls[0][1],
    };
  }

  async function checkDialogInProgress(progress: string, status: string) {
    // check dialog state
    await waitFor(() =>
      expect(dialogMessage()).toHaveTextContent("Please wait...")
    );
    expect(progressBarValue()).toStrictEqual(progress);
    expect(dialogStatus()).toHaveTextContent(status);
    expect(closeButton()).toBeNull();
  }

  async function checkDialogComplete() {
    // check final dialog state
    await waitFor(() =>
      expect(dialogMessage()).toHaveTextContent(
        "Thank you for completing the survey"
      )
    );
    await waitFor(() => expect(progressBarValue()).toBe("100%"));
    await waitFor(() =>
      expect(dialogStatus()).toHaveTextContent("Upload complete")
    );
    await waitFor(() => expect(closeButton()).not.toBeNull());
  }

  async function checkDialogFailed(progress: string) {
    // check final dialog state
    await waitFor(() => expect(dialogMessage()).toBeNull());
    await waitFor(() => expect(progressBarValue()).toStrictEqual(progress));
    await waitFor(() =>
      expect(dialogStatus()).toHaveTextContent(
        "Upload failed - please try again"
      )
    );
    await waitFor(() => expect(closeButton()).not.toBeNull());
  }

  const sectionContent = () =>
    document.querySelector(".section .submit-content");
  const uploadButton = () =>
    document.querySelector(".section .submit-survey-button")!;
  const dialog = () => document.querySelector(".dialog");
  const dialogMessage = () => document.querySelector(".dialog p");
  const dialogStatus = () =>
    document.querySelector(".dialog .submission-status");
  const closeButton = () => document.querySelector(".dialog .close-button");
  const progressBar = () =>
    document.querySelector(".dialog .progress-bar-active");
  const confirmYesButton = () => document.querySelector(".dialog #yes-button");
  const confirmNoButton = () => document.querySelector(".dialog #no-button");

  function progressBarValue() {
    const styleValue = progressBar()!.getAttribute("style")!;
    return styleValue.substring(7, styleValue.length - 1);
  }
});
