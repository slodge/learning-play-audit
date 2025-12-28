import {
  surveyReducer,
  refreshState,
  loadPhotos,
  DatedQuestionAnswer,
  QuestionAnswer,
  SurveyStoreState,
  surveyStore,
} from "./SurveyModel";
import {
  SET_ANSWER,
  REFRESH_STATE,
  RESTART_SURVEY,
  RESET_STATE,
  ADD_PHOTO,
  DELETE_PHOTO,
  UPDATE_PHOTO_DESCRIPTION,
  CONFIRM_WELCOME,
  SET_CURRENT_SECTION,
} from "./ActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
  REGISTER,
} from "learning-play-audit-shared";
import rfdc from "rfdc";
// local forage is mocked in setupTests.js
import localforage from "localforage";
import { EMPTY_STATE, INITIALISED_EMPTY_STATE, INPUT_STATE } from "./TestUtils";
import { AnyAction } from "redux";
import { GALLERY, INTRODUCTION, RESULTS } from "./SurveySections";
import { ThunkDispatch } from "redux-thunk";
import getPhotoUuid from "./SurveyPhotoUuid";

const FIXED_UUID_1 = "00000000-0000-0000-0000-000000000000";
const FIXED_UUID_2 = "00000000-0000-0000-0000-000000000001";

const clone = rfdc();

const surveyDispatch: ThunkDispatch<SurveyStoreState, any, AnyAction> =
  surveyStore.dispatch;

describe("surveyReducer", () => {
  it("initial state - empty", () => {
    expect(surveyReducer(undefined, {} as AnyAction)).toStrictEqual(
      EMPTY_STATE
    );
  });

  it("action RESET_STATE", () => {
    expect(
      surveyReducer(INPUT_STATE, {
        type: RESET_STATE,
      })
    ).toStrictEqual({ ...EMPTY_STATE, initialisingState: false });
  });

  it("action RESTART_SURVEY", () => {
    expect(
      surveyReducer(
        { ...INPUT_STATE, currentSectionId: RESULTS },
        {
          type: RESTART_SURVEY,
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      answers: EMPTY_STATE.answers,
      answerCounts: EMPTY_STATE.answerCounts,
      initialisingState: false,
      photoDetails: {},
      photos: {},
      currentSectionId: INTRODUCTION,
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

  it("action CONFIRM_WELCOME", () => {
    const inputState = {
      ...clone(INITIALISED_EMPTY_STATE),
      hasSeenSplashPage: false,
      hasEverLoggedIn: false,
    };

    expect(
      surveyReducer(inputState, {
        type: CONFIRM_WELCOME,
      })
    ).toStrictEqual({
      ...inputState,
      hasEverLoggedIn: true,
      hasSeenSplashPage: true,
    });

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: EMPTY_STATE.answerCounts,
      answers: EMPTY_STATE.answers,
      hasEverLoggedIn: true,
      hasSeenSplashPage: true,
      photoDetails: EMPTY_STATE.photoDetails,
      surveyVersion: EMPTY_STATE.surveyVersion,
    });
  });

  it("action SET_CURRENT_SECTION", () => {
    const expectedState = clone(INPUT_STATE);
    expectedState.currentSectionId = GALLERY;

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_CURRENT_SECTION,
        sectionId: GALLERY,
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).not.toHaveBeenCalled();
  });

  it("action SET_ANSWER set answer", () => {
    const expectedState = clone(INPUT_STATE);
    (expectedState.answers.pandp.P01 as QuestionAnswer).answer =
      "new answer";

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "pandp",
        questionId: "P01",
        field: "answer",
        value: "new answer",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  it("action SET_ANSWER set comment", () => {
    const expectedState = clone(INPUT_STATE);
    (expectedState.answers.pandp.P01 as QuestionAnswer).comments =
      "new comment";

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "pandp",
        questionId: "P01",
        field: "comments",
        value: "new comment",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  it("action SET_ANSWER clear answer", () => {
    const expectedState = clone(INPUT_STATE);
    (expectedState.answers.pandp.P01 as QuestionAnswer).answer = "";
    expectedState.answerCounts.pandp.answer =
      expectedState.answerCounts.pandp.answer - 1;

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "pandp",
        questionId: "P01",
        field: "answer",
        value: "",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  it("action SET_ANSWER clear comment", () => {
    const expectedState = clone(INPUT_STATE);
    (expectedState.answers.pandp.P01 as QuestionAnswer).comments =
      "";
    expectedState.answerCounts.pandp.comments =
      expectedState.answerCounts.pandp.comments - 1;

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "pandp",
        questionId: "P01",
        field: "comments",
        value: "",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  it("action SET_ANSWER add answer", () => {
    const expectedState = clone(INITIALISED_EMPTY_STATE);
    (expectedState.answers.pandp.P01 as QuestionAnswer).answer =
      "added answer";
    expectedState.answerCounts.pandp.answer =
      expectedState.answerCounts.pandp.answer + 1;

    expect(
      surveyReducer(clone(INITIALISED_EMPTY_STATE), {
        type: SET_ANSWER,
        sectionId: "pandp",
        questionId: "P01",
        field: "answer",
        value: "added answer",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  it("action SET_ANSWER add comment", () => {
    const expectedState = clone(INITIALISED_EMPTY_STATE);
    (expectedState.answers.pandp.P01 as QuestionAnswer).comments =
      "added comment";
    expectedState.answerCounts.pandp.comments =
      expectedState.answerCounts.pandp.comments + 1;

    expect(
      surveyReducer(clone(INITIALISED_EMPTY_STATE), {
        type: SET_ANSWER,
        sectionId: "pandp",
        questionId: "P01",
        field: "comments",
        value: "added comment",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  /*
  dated tests removed as we don't have dated questions any more
  it("action SET_ANSWER set datedImprovements answer", () => {
    const expectedState = clone(INPUT_STATE);
    (
      expectedState.answers.community.datedImprovements as DatedQuestionAnswer
    ).answer1 = "new answer";

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "community",
        questionId: "datedImprovements",
        field: "answer1",
        value: "new answer",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  it("action SET_ANSWER clear datedImprovements answer", () => {
    const expectedState = clone(INPUT_STATE);
    (
      expectedState.answers.community.datedImprovements as DatedQuestionAnswer
    ).year2 = "";

    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_ANSWER,
        sectionId: "community",
        questionId: "datedImprovements",
        field: "year2",
        value: "",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  it("action SET_ANSWER clear datedImprovements answer completely", () => {
    const inputState = clone(INPUT_STATE);
    // clear all but one
    const datedImprovements = inputState.answers.community
      .datedImprovements as DatedQuestionAnswer;
    datedImprovements.answer1 = "";
    datedImprovements.answer2 = "";
    datedImprovements.answer3 = "";
    datedImprovements.year1 = "";
    datedImprovements.year3 = "";

    const expectedState = clone(inputState);
    (
      expectedState.answers.community.datedImprovements as DatedQuestionAnswer
    ).year2 = "";
    expectedState.answerCounts.community.answer =
      expectedState.answerCounts.community.answer - 1;

    expect(
      surveyReducer(inputState, {
        type: SET_ANSWER,
        sectionId: "community",
        questionId: "datedImprovements",
        field: "year2",
        value: "",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  it("action SET_ANSWER add datedImprovements answer", () => {
    const expectedState = clone(INITIALISED_EMPTY_STATE);
    (
      expectedState.answers.community.datedImprovements as DatedQuestionAnswer
    ).answer3 = "added answer";
    expectedState.answerCounts.community.answer =
      expectedState.answerCounts.community.answer + 1;

    expect(
      surveyReducer(clone(INITIALISED_EMPTY_STATE), {
        type: SET_ANSWER,
        sectionId: "community",
        questionId: "datedImprovements",
        field: "answer3",
        value: "added answer",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });
  */

  it("action ADD_PHOTO", () => {
    (getPhotoUuid as jest.Mock).mockImplementation(() => FIXED_UUID_1);

    const expectedState = clone(INPUT_STATE);
    expectedState.photoDetails![FIXED_UUID_1] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    expectedState.photos![FIXED_UUID_1] = {
      imageData: "new imageData",
    };

    expect(
      surveyReducer(INPUT_STATE, {
        type: ADD_PHOTO,
        sectionId: "community",
        questionId: "datedImprovements",
        imageData: "new imageData",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: expectedState.photos,
    });
  });

  it("action ADD_PHOTO first photo", () => {
    (getPhotoUuid as jest.Mock).mockImplementation(() => FIXED_UUID_1);

    const expectedState = clone(INITIALISED_EMPTY_STATE);
    expectedState.photoDetails![FIXED_UUID_1] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    expectedState.photos![FIXED_UUID_1] = {
      imageData: "new imageData",
    };

    expect(
      surveyReducer(clone(INITIALISED_EMPTY_STATE), {
        type: ADD_PHOTO,
        sectionId: "community",
        questionId: "datedImprovements",
        imageData: "new imageData",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: expectedState.photos,
    });
  });

  it("action ADD_PHOTO not question specific", () => {
    (getPhotoUuid as jest.Mock).mockImplementation(() => FIXED_UUID_1);

    const expectedState = clone(INPUT_STATE);
    expectedState.photoDetails![FIXED_UUID_1] = {
      description: "",
      sectionId: undefined,
      questionId: undefined,
    };
    expectedState.photos![FIXED_UUID_1] = {
      imageData: "new imageData",
    };

    expect(
      surveyReducer(INPUT_STATE, {
        type: ADD_PHOTO,
        imageData: "new imageData",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: expectedState.photos,
    });
  });

  it("action DELETE_PHOTO", () => {
    const inputState = clone(INPUT_STATE);
    inputState.photoDetails![FIXED_UUID_1] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    inputState.photos![FIXED_UUID_1] = {
      imageData: "new imageData",
    };

    const expectedState = clone(INPUT_STATE);

    expect(
      surveyReducer(inputState, {
        type: DELETE_PHOTO,
        photoId: FIXED_UUID_1,
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: expectedState.photos,
    });
  });

  it("action DELETE_PHOTO photo not found", () => {
    expect(
      surveyReducer(clone(INPUT_STATE), {
        type: DELETE_PHOTO,
        photoId: FIXED_UUID_1,
      })
    ).toStrictEqual(INPUT_STATE);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INPUT_STATE.hasSeenSplashPage,
      photoDetails: INPUT_STATE.photoDetails,
      surveyVersion: INPUT_STATE.surveyVersion,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: INPUT_STATE.photos,
    });
  });

  it("action UPDATE_PHOTO_DESCRIPTION", () => {
    const inputState = clone(INPUT_STATE);
    inputState.photoDetails![FIXED_UUID_1] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    inputState.photos![FIXED_UUID_1] = {
      imageData: "new imageData",
    };

    const expectedState = clone(inputState);
    expectedState.photoDetails![FIXED_UUID_1].description = "new description";

    expect(
      surveyReducer(inputState, {
        type: UPDATE_PHOTO_DESCRIPTION,
        photoId: FIXED_UUID_1,
        description: "new description",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: expectedState.answerCounts,
      answers: expectedState.answers,
      hasEverLoggedIn: expectedState.hasEverLoggedIn,
      hasSeenSplashPage: expectedState.hasSeenSplashPage,
      photoDetails: expectedState.photoDetails,
      surveyVersion: expectedState.surveyVersion,
    });
  });

  it("action UPDATE_PHOTO_DESCRIPTION photo not found", () => {
    expect(
      surveyReducer(clone(INPUT_STATE), {
        type: UPDATE_PHOTO_DESCRIPTION,
        photoId: FIXED_UUID_1,
        description: "new description",
      })
    ).toStrictEqual(INPUT_STATE);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INPUT_STATE.hasSeenSplashPage,
      photoDetails: INPUT_STATE.photoDetails,
      surveyVersion: INPUT_STATE.surveyVersion,
    });
  });
});

describe("surveyReducer using authReducer", () => {
  it("initial state - empty", () => {
    expect(surveyReducer(undefined, {} as AnyAction)).toStrictEqual(
      EMPTY_STATE
    );
  });

  it("action SET_AUTH_ERROR", () => {
    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_AUTH_ERROR,
        message: "new error",
      })
    ).toStrictEqual({ ...INPUT_STATE, errorMessage: "new error" });

    expect(
      surveyReducer(
        { ...INPUT_STATE, errorMessage: "new error" },
        {
          type: SET_AUTH_ERROR,
          message: "",
        }
      )
    ).toStrictEqual(INPUT_STATE);

    expect(
      surveyReducer(
        { ...INPUT_STATE, errorMessage: "new error" },
        {
          type: SET_AUTH_ERROR,
          message: "new error",
        }
      )
    ).toStrictEqual({ ...INPUT_STATE, errorMessage: "new error" });
  });

  it("action CLEAR_AUTH_ERROR", () => {
    expect(
      surveyReducer(
        { ...INPUT_STATE, errorMessage: "new error" },
        { type: CLEAR_AUTH_ERROR }
      )
    ).toStrictEqual(INPUT_STATE);

    expect(
      surveyReducer(INPUT_STATE, { type: CLEAR_AUTH_ERROR })
    ).toStrictEqual(INPUT_STATE);
  });

  it("action SET_AUTH_STATE", () => {
    expect(
      surveyReducer(
        {
          ...INPUT_STATE,
          errorMessage: "test error",
          authState: SIGN_IN,
          surveyUser: { email: "test@example.com" },
          hasSeenSplashPage: true,
          hasEverLoggedIn: false,
        },
        {
          type: SET_AUTH_STATE,
          authState: REGISTER,
          surveyUser: { email: "new@example.com" },
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      errorMessage: "",
      authState: REGISTER,
      surveyUser: { email: "new@example.com" },
      hasSeenSplashPage: true,
      hasEverLoggedIn: false,
    });

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: false,
      hasSeenSplashPage: true,
      photoDetails: INPUT_STATE.photoDetails,
      surveyVersion: INPUT_STATE.surveyVersion,
    });
  });

  it("action SET_AUTH_STATE SIGNED_IN triggers flags", () => {
    expect(
      surveyReducer(
        {
          ...INPUT_STATE,
          errorMessage: "test error",
          authState: SIGN_IN,
          surveyUser: { email: "test@example.com" },
          hasSeenSplashPage: true,
          hasEverLoggedIn: false,
        },
        {
          type: SET_AUTH_STATE,
          authState: SIGNED_IN,
          surveyUser: { email: "new@example.com" },
        }
      )
    ).toStrictEqual({
      ...INPUT_STATE,
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: { email: "new@example.com" },
      hasSeenSplashPage: false,
      hasEverLoggedIn: false,
    });

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: false,
      hasSeenSplashPage: false,
      photoDetails: INPUT_STATE.photoDetails,
      surveyVersion: INPUT_STATE.surveyVersion,
    });
  });

  it("action SET_AUTH_STATE authState undefined", () => {
    expect(
      surveyReducer(INPUT_STATE, {
        type: SET_AUTH_STATE,
        surveyUser: "new user",
      })
    ).toStrictEqual(INPUT_STATE);

    // Check calls
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INPUT_STATE.hasSeenSplashPage,
      photoDetails: INPUT_STATE.photoDetails,
      surveyVersion: INPUT_STATE.surveyVersion,
    });
  });
});

describe("surveyReducer actions pre-initialisation should not write to storage", () => {
  it("action CONFIRM_WELCOME", () => {
    const inputState = {
      ...clone(EMPTY_STATE),
      initialisingState: true,
      hasSeenSplashPage: false,
    };

    expect(
      surveyReducer(inputState, {
        type: CONFIRM_WELCOME,
      })
    ).toStrictEqual({
      ...EMPTY_STATE,
      hasSeenSplashPage: true,
      hasEverLoggedIn: true,
    });

    // Check calls
    expect(localforage.setItem).not.toHaveBeenCalled();
  });

  it("action ADD_PHOTO", () => {
    (getPhotoUuid as jest.Mock).mockImplementation(() => FIXED_UUID_1);

    const inputState = {
      ...clone(INPUT_STATE),
      initialisingState: true,
    };

    const expectedState = clone(inputState);
    expectedState.photoDetails![FIXED_UUID_1] = {
      description: "",
      sectionId: "community",
      questionId: "datedImprovements",
    };
    expectedState.photos![FIXED_UUID_1] = {
      imageData: "new imageData",
    };

    expect(
      surveyReducer(inputState, {
        type: ADD_PHOTO,
        sectionId: "community",
        questionId: "datedImprovements",
        imageData: "new imageData",
      })
    ).toStrictEqual(expectedState);

    // Check calls
    expect(localforage.setItem).not.toHaveBeenCalled();
  });
});

describe("refreshState", () => {
  const STORED_ANSWERS = {
    answers: "stored answers",
    answerCounts: "stored answerCounts",
    photoDetails: "stored photoDetails",
    hasSeenSplashPage: "stored hasSeenSplashPage",
    hasEverLoggedIn: "stored hasEverLoggedIn",
  } as unknown as SurveyStoreState;

  const STORED_PHOTOS = {
    photos: "stored photos",
  } as unknown as SurveyStoreState;

  function mockLocalForageGetItem(
    answers: SurveyStoreState | null,
    photos: SurveyStoreState | null
  ) {
    (localforage.getItem as jest.Mock).mockImplementation((itemId) => {
      if (itemId === "answers") {
        return Promise.resolve(answers);
      }
      if (itemId === "photos") {
        return Promise.resolve(photos);
      }
      return Promise.reject(new Error("Unexpected getItem " + itemId));
    });
  }

  beforeEach(() => {
    surveyDispatch({ type: REFRESH_STATE, state: INPUT_STATE });
  });

  it("stored answers and photos", async () => {
    mockLocalForageGetItem(STORED_ANSWERS, STORED_PHOTOS);

    await surveyDispatch(refreshState());

    expect(surveyStore.getState()).toStrictEqual({
      ...INPUT_STATE,
      answerCounts: "stored answerCounts",
      answers: "stored answers",
      hasEverLoggedIn: "stored hasEverLoggedIn",
      hasSeenSplashPage: "stored hasSeenSplashPage",
      initialisingState: false,
      photoDetails: "stored photoDetails",
      photos: "stored photos",
    });

    // Check calls
    expect(localforage.getItem).toHaveBeenCalledTimes(2);
    expect(localforage.getItem).toHaveBeenCalledWith("answers");
    expect(localforage.getItem).toHaveBeenCalledWith("photos");
  });

  it("stored answers only", async () => {
    mockLocalForageGetItem(STORED_ANSWERS, null);

    await surveyDispatch(refreshState());
    expect(surveyStore.getState()).toStrictEqual({
      ...INPUT_STATE,
      answerCounts: "stored answerCounts",
      answers: "stored answers",
      hasEverLoggedIn: "stored hasEverLoggedIn",
      hasSeenSplashPage: "stored hasSeenSplashPage",
      initialisingState: false,
      photoDetails: "stored photoDetails",
      photos: INPUT_STATE.photos,
    });

    // Check calls
    expect(localforage.getItem).toHaveBeenCalledTimes(2);
    expect(localforage.getItem).toHaveBeenCalledWith("answers");
    expect(localforage.getItem).toHaveBeenCalledWith("photos");
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: INPUT_STATE.photos,
    });
  });

  it("stored photos only", async () => {
    mockLocalForageGetItem(null, STORED_PHOTOS);

    await surveyDispatch(refreshState());
    expect(surveyStore.getState()).toStrictEqual({
      ...INPUT_STATE,
      initialisingState: false,
      photos: "stored photos",
    });

    // Check calls
    expect(localforage.getItem).toHaveBeenCalledTimes(2);
    expect(localforage.getItem).toHaveBeenCalledWith("answers");
    expect(localforage.getItem).toHaveBeenCalledWith("photos");
    expect(localforage.setItem).toHaveBeenCalledTimes(1);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INPUT_STATE.hasEverLoggedIn,
      photoDetails: INPUT_STATE.photoDetails,
      surveyVersion: INPUT_STATE.surveyVersion,
    });
  });

  it("nothing stored", async () => {
    mockLocalForageGetItem(null, null);

    await surveyDispatch(refreshState());
    expect(surveyStore.getState()).toStrictEqual({
      ...INPUT_STATE,
      initialisingState: false,
    });

    // Check calls
    expect(localforage.getItem).toHaveBeenCalledTimes(2);
    expect(localforage.getItem).toHaveBeenCalledWith("answers");
    expect(localforage.getItem).toHaveBeenCalledWith("photos");
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INPUT_STATE.hasEverLoggedIn,
      photoDetails: INPUT_STATE.photoDetails,
      surveyVersion: INPUT_STATE.surveyVersion,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: INPUT_STATE.photos,
    });
  });

  it("read failed - don't refresh state", async () => {
    (localforage.getItem as jest.Mock).mockImplementation((itemId) => {
      return Promise.reject(new Error("GetItem failed " + itemId));
    });

    await surveyDispatch(refreshState());
    expect(surveyStore.getState()).toStrictEqual(INPUT_STATE);

    // Check calls
    expect(localforage.getItem).toHaveBeenCalledTimes(2);
    expect(localforage.getItem).toHaveBeenCalledWith("answers");
    expect(localforage.getItem).toHaveBeenCalledWith("photos");
    expect(localforage.setItem).not.toHaveBeenCalled();
  });

  it("write failed - continue to refresh state", async () => {
    mockLocalForageGetItem(null, null);

    (localforage.setItem as jest.Mock).mockImplementation((itemId) => {
      return Promise.reject(new Error("SetItem failed " + itemId));
    });

    await surveyDispatch(refreshState());
    expect(surveyStore.getState()).toStrictEqual({
      ...INPUT_STATE,
      initialisingState: false,
    });

    // Check calls
    expect(localforage.getItem).toHaveBeenCalledTimes(2);
    expect(localforage.getItem).toHaveBeenCalledWith("answers");
    expect(localforage.getItem).toHaveBeenCalledWith("photos");
    expect(localforage.setItem).toHaveBeenCalledTimes(2);
    expect(localforage.setItem).toHaveBeenCalledWith("answers", {
      answerCounts: INPUT_STATE.answerCounts,
      answers: INPUT_STATE.answers,
      hasEverLoggedIn: INPUT_STATE.hasEverLoggedIn,
      hasSeenSplashPage: INPUT_STATE.hasEverLoggedIn,
      photoDetails: INPUT_STATE.photoDetails,
      surveyVersion: INPUT_STATE.surveyVersion,
    });
    expect(localforage.setItem).toHaveBeenCalledWith("photos", {
      photos: INPUT_STATE.photos,
    });
  });
});

describe("loadPhotos", () => {
  const IMAGEDATA1 = "test image data1";
  const IMAGEDATA2 = "test image data2";
  const IMAGEDATA1_BASE64 = Buffer.from(IMAGEDATA1).toString("base64");
  const IMAGEDATA2_BASE64 = Buffer.from(IMAGEDATA2).toString("base64");
  const INPUT_FILE1 = new Blob([Buffer.from(IMAGEDATA1)], { type: "mimeType" });
  const INPUT_FILE2 = new Blob([Buffer.from(IMAGEDATA2)], { type: "mimeType" });

  beforeEach(() => {
    surveyDispatch({ type: REFRESH_STATE, state: INPUT_STATE });
  });

  it("single load for question", async () => {
    (getPhotoUuid as jest.Mock).mockImplementation(() => FIXED_UUID_1);

    await surveyDispatch(
      loadPhotos([INPUT_FILE1], "community", "communityoutside")
    );

    expect(surveyStore.getState()).toStrictEqual({
      ...INPUT_STATE,
      photoDetails: {
        ...INPUT_STATE.photoDetails,
        [FIXED_UUID_1]: {
          description: "",
          sectionId: "community",
          questionId: "communityoutside",
        },
      },
      photos: {
        ...INPUT_STATE.photos,
        [FIXED_UUID_1]: { imageData: IMAGEDATA1_BASE64 },
      },
    });
  });

  it("multiple load for question", async () => {
    (getPhotoUuid as jest.Mock)
      .mockImplementationOnce(() => FIXED_UUID_1)
      .mockImplementationOnce(() => FIXED_UUID_2);

    await surveyDispatch(
      loadPhotos([INPUT_FILE1, INPUT_FILE2], "community", "communityoutside")
    );

    expect(surveyStore.getState()).toStrictEqual({
      ...INPUT_STATE,
      photoDetails: {
        ...INPUT_STATE.photoDetails,
        [FIXED_UUID_1]: {
          description: "",
          sectionId: "community",
          questionId: "communityoutside",
        },
        [FIXED_UUID_2]: {
          description: "",
          sectionId: "community",
          questionId: "communityoutside",
        },
      },
      photos: {
        ...INPUT_STATE.photos,
        [FIXED_UUID_1]: { imageData: IMAGEDATA1_BASE64 },
        [FIXED_UUID_2]: { imageData: IMAGEDATA2_BASE64 },
      },
    });
  });

  it("load general", async () => {
    (getPhotoUuid as jest.Mock).mockImplementation(() => FIXED_UUID_1);

    await surveyDispatch(loadPhotos([INPUT_FILE1]));
    expect(surveyStore.getState()).toStrictEqual({
      ...INPUT_STATE,
      photoDetails: {
        ...INPUT_STATE.photoDetails,
        [FIXED_UUID_1]: {
          description: "",
          questionId: undefined,
          sectionId: undefined,
        },
      },
      photos: {
        ...INPUT_STATE.photos,
        [FIXED_UUID_1]: { imageData: IMAGEDATA1_BASE64 },
      },
    });
  });

  it("empty array", async () => {
    await surveyDispatch(loadPhotos([]));
    expect(surveyStore.getState()).toStrictEqual(INPUT_STATE);
  });
});
