import { createStore, applyMiddleware, AnyAction } from "redux";
import thunk, { ThunkAction } from "redux-thunk";
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
  authReducer,
  SET_AUTH_STATE,
  REGISTER,
  SIGNED_IN,
  AuthStoreState,
} from "learning-play-audit-shared";
import {
  TEXT_WITH_YEAR,
  sectionQuestions,
  current_survey_version,
} from "learning-play-audit-survey";
import localforage from "localforage";
import getPhotoUuid from "./SurveyPhotoUuid";
import { INTRODUCTION } from "./SurveySections";
import { Buffer } from "buffer/";

// eslint-disable-next-line jest/require-hook
localforage.config({
  name: "learning-play-audit",
  version: 1.0,
  storeName: "surveyanswers",
  description: "survey answers",
});

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

export interface SectionAnswerCount {
  answer: number;
  comments: number;
}

export type SurveyAnswerCounts = Record<string, SectionAnswerCount>;

export interface PhotoDetails {
  description: string;
  sectionId?: string;
  questionId?: string;
}

export interface Photo {
  imageData: string;
}

export interface SurveyStoreState extends AuthStoreState {
  answers: SurveyAnswers;
  answerCounts: SurveyAnswerCounts;
  photos: Record<string, Photo>;
  photoDetails: Record<string, PhotoDetails>;
  hasSeenSplashPage: boolean;
  hasEverLoggedIn: boolean;
  initialisingState: boolean;
  currentSectionId: string;
  surveyVersion: string;
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  SurveyStoreState,
  unknown,
  AnyAction
>;

function createEmptyAnswers(): SurveyAnswers {
  const sections: SurveyAnswers = {};
  current_survey_version().sections.forEach((section) => {
    var questions: SectionAnswers = {};
    sections[section.id] = questions;
    sectionQuestions(section).forEach(({ type, id }) => {
      questions[id] =
        createEmptyAnswerOfType(type);
    });
  });
  return sections;
}

function createEmptyAnswerOfType(type: string): QuestionAnswer | DatedQuestionAnswer {
  return type === TEXT_WITH_YEAR
    ? {
      answer1: "",
      year1: "",
      answer2: "",
      year2: "",
      answer3: "",
      year3: "",
    }
    : { answer: "", comments: "" };
}

function createAnswerCounts(): SurveyAnswerCounts {
  const result: SurveyAnswerCounts = {};
  current_survey_version().sections.forEach((section) => {
    result[section.id] = { answer: 0, comments: 0 };
  });
  return result;
}

function initialState(): SurveyStoreState {
  console.debug("Setting initialState");
  return {
    answers: createEmptyAnswers(),
    answerCounts: createAnswerCounts(),
    photos: {},
    photoDetails: {},
    authState: REGISTER,
    errorMessage: "",
    hasSeenSplashPage: false,
    hasEverLoggedIn: false,
    initialisingState: true,
    currentSectionId: INTRODUCTION,
    surveyVersion: current_survey_version().version,
  };
}

// Exported for unit tests only
function surveyAnswersReducer(
  state: SurveyStoreState,
  action: AnyAction
): SurveyStoreState {
  let newState: SurveyStoreState;
  switch (action.type) {
    case CONFIRM_WELCOME:
      console.debug("CONFIRM_WELCOME");
      newState = { ...state, hasSeenSplashPage: true, hasEverLoggedIn: true };
      writeAnswers(newState);
      return newState;

    case SET_CURRENT_SECTION:
      console.debug("SET_CURRENT_SECTION", action);
      return { ...state, currentSectionId: action.sectionId };

    case SET_ANSWER:
      console.debug("SET_ANSWER", action);
      newState = setAnswer(
        state,
        action.sectionId,
        action.questionId,
        action.field,
        action.value
      );
      writeAnswers(newState);
      return newState;

    case RESET_STATE:
      console.debug("RESET_STATE");
      newState = { ...initialState(), initialisingState: false };
      writeAnswers(newState);
      writePhotos(newState);
      return newState;

    case RESTART_SURVEY:
      console.debug("RESTART_SURVEY");
      newState = {
        ...state,
        answers: createEmptyAnswers(),
        answerCounts: createAnswerCounts(),
        photos: {},
        photoDetails: {},
        initialisingState: false,
        currentSectionId: INTRODUCTION,
      };
      writeAnswers(newState);
      writePhotos(newState);
      return newState;

    case REFRESH_STATE:
      console.debug("REFRESH_STATE", action.state);
      return action.state;

    case ADD_PHOTO:
      console.debug("ADD_PHOTO");
      newState = addPhoto(state, action);
      writeAnswers(newState);
      writePhotos(newState);
      return newState;

    case DELETE_PHOTO:
      console.debug("DELETE_PHOTO");
      newState = deletePhoto(state, action);
      writeAnswers(newState);
      writePhotos(newState);
      return newState;

    case UPDATE_PHOTO_DESCRIPTION:
      console.debug("UPDATE_PHOTO_DESCRIPTION", action);
      newState = updatePhotoDescription(state, action);
      writeAnswers(newState);
      return newState;

    case SET_AUTH_STATE:
      console.debug("SET_AUTH_STATE");
      newState = {
        ...state,
        // Show welcome screen on every login
        hasSeenSplashPage:
          state.hasSeenSplashPage && action.authState !== SIGNED_IN,
      };
      // Action handled in authReducer, but persist here
      writeAnswers(newState);
      return newState;

    default:
      return state;
  }
}

function addPhoto(
  state: SurveyStoreState,
  action: AnyAction
): SurveyStoreState {
  console.debug("addPhoto", action.sectionId, action.questionId);
  const photoId = getPhotoUuid();
  return {
    ...state,
    photoDetails: {
      ...state.photoDetails,
      [photoId]: {
        description: "",
        sectionId: action.sectionId,
        questionId: action.questionId,
      },
    },
    photos: { ...state.photos, [photoId]: { imageData: action.imageData } },
  };
}

export function loadPhotos(
  files: Blob[],
  sectionId?: string,
  questionId?: string
): AppThunk {
  console.debug("loadPhoto", sectionId, questionId);
  return function (dispatch) {
    return Promise.allSettled(
      files.map((file) =>
        readFileAsync(file).then((data) =>
          dispatch({
            type: ADD_PHOTO,
            imageData: Buffer.from(data).toString("base64"),
            sectionId,
            questionId,
          })
        )
      )
    );
  };
}

function readFileAsync(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      console.debug("photo loaded");
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

function deletePhoto(
  state: SurveyStoreState,
  action: AnyAction
): SurveyStoreState {
  console.debug("deletePhoto", action);
  const result: SurveyStoreState = { ...state };
  result.photoDetails = { ...state.photoDetails };
  delete result.photoDetails[action.photoId];
  result.photos = { ...state.photos };
  delete result.photos[action.photoId];
  return result;
}

function updatePhotoDescription(
  state: SurveyStoreState,
  action: AnyAction
): SurveyStoreState {
  const photoId = action.photoId;
  const photo = state.photoDetails[photoId];
  if (photo === undefined) {
    return state;
  }
  return {
    ...state,
    photoDetails: {
      ...state.photoDetails,
      [photoId]: { ...photo, description: action.description },
    },
  };
}

export function refreshState(): AppThunk {
  return function (dispatch, getState) {
    return Promise.all([readAnswers(), readPhotos()])
      .then(([storedAnswers, storedPhotos]) => {
        const state = { ...getState(), initialisingState: false };
        if (storedAnswers === null) {
          writeAnswers(state).catch((err) => console.error(err));
        } else {
          storedAnswers = checkAndRepairStateAgainstSurvey(storedAnswers);
        }
        if (storedPhotos === null) {
          writePhotos(state).catch((err) => console.error(err));
        }
        dispatch({
          type: REFRESH_STATE,
          state: {
            ...state,
            ...(storedAnswers !== null ? storedAnswers : {}),
            ...(storedPhotos !== null ? storedPhotos : {}),
          },
        });
      })
      .catch((err) => console.error(err));
  };
}

const writeAnswers = ({
  answers,
  answerCounts,
  photoDetails,
  hasSeenSplashPage,
  hasEverLoggedIn,
  initialisingState,
  surveyVersion,
}: SurveyStoreState) => {
  console.debug("writeAnswers");
  if (initialisingState) {
    console.debug("Still initialisingState, skipping writeAnswers");
    return Promise.resolve();
  }
  return localforage.setItem("answers", {
    answers,
    answerCounts,
    photoDetails,
    hasSeenSplashPage,
    hasEverLoggedIn,
    surveyVersion,
  });
};
const readAnswers = (): Promise<SurveyStoreState | null> =>
  localforage.getItem("answers");

const writePhotos = ({ photos, initialisingState }: SurveyStoreState) => {
  console.debug("writePhotos");
  if (initialisingState) {
    console.debug("Still initialisingState, skipping writePhotos");
    return Promise.resolve();
  }
  return localforage.setItem("photos", { photos });
};
const readPhotos = (): Promise<SurveyStoreState | null> =>
  localforage.getItem("photos");

function checkAndRepairStateAgainstSurvey(
  stored: SurveyStoreState 
): SurveyStoreState {
  console.log("Checking survey state against current survey");
  
  const sectionsSeen = current_survey_version().sections.map(section => section.id);
  const current_sections = current_survey_version().sections
  current_sections.forEach((section) => {
    if (!stored.answers[section.id]) {
      console.log("Adding new answer section " + section.id);
      stored.answers[section.id] = {};
      stored.answerCounts[section.id] = { answer: 0, comments: 0 };
    }

    const seenQuestionIds:string[] = [];
    let currentAnswerCount = 0;
    let currentCommentsCount = 0;
    section.subsections.flatMap(s => s.questions).forEach((question) => {
      seenQuestionIds.push(question.id);
      if (stored.answers[section.id][question.id]) {
        // NOTE: WARNING! This next line won't work if any DatedQuestionAnswers get added again
        const current = (stored.answers[section.id][question.id] as QuestionAnswer);
        const hasAnswerValue = (current.answer !== null && current.answer.length > 0);
        const hasCommentValue = (current.comments !== null && current.comments.length > 0);
        if (hasAnswerValue) currentAnswerCount++;
        if (hasCommentValue) currentCommentsCount++;
      } else {
        console.log(`Adding new answer ${section.id} ${question.id}`);
        stored.answers[section.id][question.id] = createEmptyAnswerOfType(question.type);
      }
    });
    Object.keys(stored.answers[section.id]).forEach((answerId) => {
      if (!seenQuestionIds.includes(answerId)) {
        console.log(`Deleting old answer ${section.id} ${answerId}`);
        delete stored.answers[section.id][answerId];
      }
    });

    stored.answerCounts[section.id]["answer"] = currentAnswerCount;
    stored.answerCounts[section.id]["comments"] = currentCommentsCount;  
  });

  Object.keys(stored.answers).forEach(sectionId => {
    if (!sectionsSeen.includes(sectionId)) {
      console.log(`Deleting old answer section ${sectionId}`);
      delete stored.answers[sectionId];
    }
  });
  Object.keys(stored.answerCounts).forEach(sectionId => {
    if (!sectionsSeen.includes(sectionId)) {
      console.log(`Deleting old answerCount section ${sectionId}`);
      delete stored.answerCounts[sectionId];
    }
  });

  // TODO - possibly should also prune/correct some photos...

  return stored;
}

function setAnswer(
  state: SurveyStoreState,
  sectionId: string,
  questionId: string,
  field: QuestionAnswerKey | DatedQuestionAnswerKey,
  value: string
) {
  if (sectionId === "community" && questionId === "datedImprovements") {
    // Special case
    return setDatedImprovementsAnswer(
      state,
      sectionId,
      questionId,
      field as DatedQuestionAnswerKey,
      value
    );
  }

  const previousAnswer = state.answers[sectionId][questionId] as QuestionAnswer;

  const previousValue = previousAnswer[field as QuestionAnswerKey];
  const answer = { ...previousAnswer, [field]: value };
  const result = { ...state };
  result.answers = { ...state.answers };
  result.answers[sectionId] = { ...state.answers[sectionId] };
  result.answers[sectionId][questionId] = answer;

  const hasPreviousValue = previousValue !== null && previousValue.length > 0;
  const hasCurrentValue = value !== null && value.length > 0;

  if (hasPreviousValue !== hasCurrentValue) {
    result.answerCounts[sectionId] = { ...result.answerCounts[sectionId] };
    result.answerCounts[sectionId][field as QuestionAnswerKey] +=
      hasCurrentValue ? 1 : -1;
  }

  return result;
}

function setDatedImprovementsAnswer(
  state: SurveyStoreState,
  sectionId: string,
  questionId: string,
  field: DatedQuestionAnswerKey,
  value: string
) {
  const FIELDNAMES: DatedQuestionAnswerKey[] = [
    "answer1",
    "answer2",
    "answer3",
    "year1",
    "year2",
    "year3",
  ];

  const previousValues = state.answers[sectionId][
    questionId
  ] as DatedQuestionAnswer;
  const answer = {
    ...previousValues,
    [field]: value,
  };
  const result = { ...state };
  result.answers = { ...result.answers };
  result.answers[sectionId] = {
    ...result.answers[sectionId],
  };
  result.answers[sectionId][questionId] = answer;

  const hasPreviousValue =
    FIELDNAMES.find(
      (fieldName) =>
        previousValues[fieldName] !== null &&
        previousValues[fieldName].length > 0
    ) !== undefined;
  const hasCurrentValue =
    FIELDNAMES.find(
      (fieldName) => answer[fieldName] !== null && answer[fieldName].length > 0
    ) !== undefined;

  if (hasPreviousValue !== hasCurrentValue) {
    result.answerCounts[sectionId] = { ...result.answerCounts[sectionId] };
    result.answerCounts[sectionId]["answer"] += hasCurrentValue ? 1 : -1;
  }
  return result;
}

// Exported for unit tests
export function surveyReducer(
  state = initialState(),
  action = {} as AnyAction
) {
  return surveyAnswersReducer(
    authReducer(state, action) as SurveyStoreState,
    action
  );
}

export const surveyStore = createStore(surveyReducer, applyMiddleware(thunk));

export function getPhotoDetails(state: SurveyStoreState) {
  return state.photoDetails;
}
export function getAnswers(state: SurveyStoreState) {
  return state.answers;
}
export function getAnswerCounts(state: SurveyStoreState) {
  return state.answerCounts;
}
export function getPhotos(state: SurveyStoreState) {
  return state.photos;
}
export function getHasEverLoggedIn(state: SurveyStoreState) {
  return state.hasEverLoggedIn;
}
export function getHasSeenSplashPage(state: SurveyStoreState) {
  return state.hasSeenSplashPage;
}
export function getInitialisingState(state: SurveyStoreState) {
  return state.initialisingState;
}
export function getCurrentSectionId(state: SurveyStoreState) {
  return state.currentSectionId;
}
