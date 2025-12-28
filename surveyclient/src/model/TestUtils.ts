import { REGISTER, SIGNED_IN } from "learning-play-audit-shared";
import {
  SectionAnswers,
  SurveyAnswerCounts,
  SurveyAnswers,
  SurveyStoreState,
} from "./SurveyModel";
import { INTRODUCTION } from "./SurveySections";

const SURVEY_ANSWERS: SurveyAnswers = {
  background: {
    contactname: { answer: "", comments: "" },
    localauthority: { answer: "", comments: "" },
    position: { answer: "", comments: "" },
    school: { answer: "", comments: "" },
    telephone: { answer: "", comments: "" },
  },
  pandp: {
    P01: { answer: "", comments: "" },
    P02: { answer: "", comments: "" },
    P03: { answer: "", comments: "" },
    P04: { answer: "", comments: "" },
    P05: { answer: "", comments: "" },
    P06: { answer: "", comments: "" },
    P07: { answer: "", comments: "" },
    P08: { answer: "", comments: "" },
    P09: { answer: "", comments: "" },
    P10: { answer: "", comments: "" },
    P11: { answer: "", comments: "" },
    P12: { answer: "", comments: "" },
    P13: { answer: "", comments: "" },
    P14: { answer: "", comments: "" },
    P15: { answer: "", comments: "" },
    //P16 missing deliberately
    //P16: { answer: "", comments: "" },
    P17: { answer: "", comments: "" },
    P18: { answer: "", comments: "" },
    P19: { answer: "", comments: "" },
    P20: { answer: "", comments: "" },
    P21: { answer: "", comments: "" },
    P22: { answer: "", comments: "" },
    P23: { answer: "", comments: "" },
    P24: { answer: "", comments: "" },
    P25: { answer: "", comments: "" },
    P26: { answer: "", comments: "" },
    P27: { answer: "", comments: "" },
    P28: { answer: "", comments: "" },
    P29: { answer: "", comments: "" },
    P30: { answer: "", comments: "" },
    P31: { answer: "", comments: "" },
    P32: { answer: "", comments: "" },
  },
  nature: {
    GC01: { answer: "", comments: "" },
    GC02: { answer: "", comments: "" },
    GC03: { answer: "", comments: "" },
    GC04: { answer: "", comments: "" },
    GC05: { answer: "", comments: "" },
    GC06: { answer: "", comments: "" },
    GC07: { answer: "", comments: "" },
    GC08: { answer: "", comments: "" },
    N09: { answer: "", comments: "" },
    N10: { answer: "", comments: "" },
    N11: { answer: "", comments: "" },
    N12: { answer: "", comments: "" },
    N13: { answer: "", comments: "" },
    N14: { answer: "", comments: "" },
    N15: { answer: "", comments: "" },
    N16: { answer: "", comments: "" },
    SF01: { answer: "", comments: "" },
    SF02: { answer: "", comments: "" },
    SF03: { answer: "", comments: "" },
    SF04: { answer: "", comments: "" },
    //SF05: { answer: "", comments: "" },
    SF06: { answer: "", comments: "" },
    SF07: { answer: "", comments: "" },
    SF08: { answer: "", comments: "" },
    SF09: { answer: "", comments: "" },
    SF10: { answer: "", comments: "" },
    SF11: { answer: "", comments: "" },
  },
  temperature: {
    T01: { answer: "", comments: "" },
    T02: { answer: "", comments: "" },
    T03: { answer: "", comments: "" },
    T04: { answer: "", comments: "" },
    T05: { answer: "", comments: "" },
    T06: { answer: "", comments: "" },
    T07: { answer: "", comments: "" },
    T08: { answer: "", comments: "" },
    T09: { answer: "", comments: "" },
    T10: { answer: "", comments: "" },
    T11: { answer: "", comments: "" },
    T12: { answer: "", comments: "" },
    T13: { answer: "", comments: "" },
    T14: { answer: "", comments: "" },
    T15: { answer: "", comments: "" },
    //T16: { answer: "", comments: "" },
    T17: { answer: "", comments: "" },
    T18: { answer: "", comments: "" },
    T19: { answer: "", comments: "" },
    T20: { answer: "", comments: "" },
    T21: { answer: "", comments: "" },
    T22: { answer: "", comments: "" },
    T23: { answer: "", comments: "" },
    T24: { answer: "", comments: "" },
    T25: { answer: "", comments: "" },
  },
  water: {
    WA01: { answer: "", comments: "" },
    WA02: { answer: "", comments: "" },
    WA03: { answer: "", comments: "" },
    WA04: { answer: "", comments: "" },
    WA05: { answer: "", comments: "" },
    WA06: { answer: "", comments: "" },
    WA07: { answer: "", comments: "" },
    WA08: { answer: "", comments: "" },
    //WA09: { answer: "", comments: "" },
    WA10: { answer: "", comments: "" },
    WA11: { answer: "", comments: "" },
    WA12: { answer: "", comments: "" },
    WA13: { answer: "", comments: "" },
    WA14: { answer: "", comments: "" },
    WA15: { answer: "", comments: "" },
    WA16: { answer: "", comments: "" },
  },
  carbon: {
    C01: { answer: "", comments: "" },
    C02: { answer: "", comments: "" },
    C03: { answer: "", comments: "" },
    C04: { answer: "", comments: "" },
    C05: { answer: "", comments: "" },
    C06: { answer: "", comments: "" },
    C07: { answer: "", comments: "" },
  },
  air: {
    A01: { answer: "", comments: "" },
    A02: { answer: "", comments: "" },
    A03: { answer: "", comments: "" },
    A04: { answer: "", comments: "" },
    A05: { answer: "", comments: "" },
    //A06: { answer: "", comments: "" },
    A07: { answer: "", comments: "" },
  },
};

export const EMPTY_STATE: SurveyStoreState = {
  answerCounts: {    
    background: { answer: 0, comments: 0 },
    pandp: { answer: 0, comments: 0 },
    nature: { answer: 0, comments: 0 },
    air: { answer: 0, comments: 0 },
    water: { answer: 0, comments: 0 },
    temperature: { answer: 0, comments: 0 },
    carbon: { answer: 0, comments: 0 },
  },
  answers: {
    ...SURVEY_ANSWERS,
  },
  authState: REGISTER,
  errorMessage: "",
  hasEverLoggedIn: false,
  hasSeenSplashPage: false,
  initialisingState: true,
  photoDetails: {},
  photos: {},
  currentSectionId: INTRODUCTION,
  surveyVersion: "0.10.0",
};

export const INITIALISED_EMPTY_STATE = {
  ...EMPTY_STATE,
  initialisingState: false,
};

function createTestState(): SurveyStoreState {
  function populateAnswerCounts() {
    const result: SurveyAnswerCounts = {};
    Object.keys(EMPTY_STATE.answerCounts).forEach((item, i) => {
      result[item] = {
        answer: i,
        comments: i + 10,
      };
    });
    return result;
  }

  function populateSectionAnswers(section: SectionAnswers) {
    const result = { ...section };
    Object.keys(result).forEach((item) => {
      if (result[item].hasOwnProperty("answer")) {
        result[item] = {
          answer: "test " + item,
          comments: "test comment " + item,
        };
      } else {
        result[item] = {
          answer1: "test1 " + item,
          answer2: "test2 " + item,
          answer3: "test3 " + item,
          year1: "year1 " + item,
          year2: "year2 " + item,
          year3: "year3 " + item,
        };
      }
    });
    return result;
  }

  function populateAnswers() {
    const result = { ...EMPTY_STATE.answers };
    Object.keys(result).forEach((item) => {
      result[item] = populateSectionAnswers(result[item]);
    });
    return result;
  }

  return {
    ...EMPTY_STATE,
    answerCounts: populateAnswerCounts(),
    answers: populateAnswers(),
    hasEverLoggedIn: !EMPTY_STATE.hasEverLoggedIn,
    hasSeenSplashPage: !EMPTY_STATE.hasSeenSplashPage,
    initialisingState: false,
    authState: SIGNED_IN,
    errorMessage: "",
    surveyUser: { email: "test@example.com" },
    photos: {
      testPhotoId1: {
        imageData: Buffer.from("image data1").toString("base64"),
      },
      testPhotoId2: {
        imageData: Buffer.from("image data2").toString("base64"),
      },
      testPhotoId3: {
        imageData: Buffer.from("image data3").toString("base64"),
      },
    },
    photoDetails: {
      testPhotoId1: {
        description: "test photo1",
        sectionId: "pandp",
        questionId: "P01",
      },
      testPhotoId2: {
        description: "test photo2",
        sectionId: "pandp",
        questionId: "P02",
      },
      testPhotoId3: {
        description: "test photo3",
      },
    },
  };
}

export const INPUT_STATE = createTestState();
