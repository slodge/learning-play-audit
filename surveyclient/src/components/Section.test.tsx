import React from "react";
import Section from "./Section";
import { QuestionAnswer, surveyStore } from "../model/SurveyModel";
import { REFRESH_STATE, SET_CURRENT_SECTION } from "../model/ActionTypes";
import { INPUT_STATE } from "../model/TestUtils";
import rfdc from "rfdc";
import {
  BACKGROUND,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
  Section as SurveySection,
} from "learning-play-audit-survey";
import { renderWithStore } from "./ReactTestUtils";

const scrollBySpy = jest.spyOn(window, "scrollBy");

const clone = rfdc();

const SECTION_CONTENT: SurveySection = {
  number: 6,
  title: "Community and Participation",
  id: "pandp",
  subsections: [
    {
      title: {
        tag: "h2",
        content: "Test questions",
      },
      questions: [
        {
          type: USER_TYPE_WITH_COMMENT,
          id: "P01",
          text: "question 1",
        },
        { type: SCALE_WITH_COMMENT, id: "P10", text: "question 2" },
        { type: TEXT_WITH_YEAR, id: "P03", text: "question 3" },
        { type: TEXT_AREA, id: "P04", text: "question 4" },
      ],
    },
  ],
};

let sectionContent: SurveySection;

const NOTE_BUTTON_TEXT = "Add Additional Information?";
const PHOTO_BUTTON_TEXT = "add photoAdd Relevant Photo?";

describe("component Section", () => {
  beforeEach(() => {
    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
    surveyStore.dispatch({ type: SET_CURRENT_SECTION, sectionId: "pandp" });
    sectionContent = SECTION_CONTENT;
  });

  it("standard render", () => {
    renderWithStore(<Section section={sectionContent} />);

    expect(mobileHeader()).toHaveTextContent(
      "6Community and Participation3 questions remaining1/4"
    );
    expect(section().querySelector("h1")).toHaveTextContent(
      "6. Community and Participation"
    );
    expect(section().querySelector("h2")).toHaveTextContent("Test questions");
    expect(
      Array.from(questions()).map((question) => question.textContent)
    ).toStrictEqual([
      "I am ateacherparentpupilother Details",
      "2question 2strongly agreetend to agreetend to disagreestrongly disagree" +
        NOTE_BUTTON_TEXT +
        PHOTO_BUTTON_TEXT,
      "3question 3" +
        PHOTO_BUTTON_TEXT +
        "Improvement 1YearImprovement 2YearImprovement 3Year",
      "4question 4" + 
        PHOTO_BUTTON_TEXT + 
        "test P04",
    ]);
    expect(section().getAttribute("class")).not.toContain("background");
  });

  it("background section render", () => {
    sectionContent = {
      ...SECTION_CONTENT,
      id: BACKGROUND,
      subsections: [
        {
          title: {
            tag: "h2",
            content: "Test questions",
          },
          questions: [],
        },
      ],
    };

    renderWithStore(<Section section={sectionContent} />);

    expect(section().querySelector("h2")).toHaveTextContent("Test questions");
    expect(section().getAttribute("class")).toContain("background");
  });

  it("scroll to unanswered - none unanswered (shortcut using answerCounts)", async () => {
    const inputState = clone(INPUT_STATE);
    inputState.answerCounts.pandp.answer = 50;
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { user } = renderWithStore(<Section section={sectionContent} />);

    await user.click(mobileHeader());
    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  it("scroll to unanswered - none unanswered", async () => {
    const { user } = renderWithStore(<Section section={sectionContent} />);

    await user.click(mobileHeader());
    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  it("scroll to unanswered - one unanswered", async () => {
    const inputState = clone(INPUT_STATE);
    (inputState.answers.pandp.P04 as QuestionAnswer).answer = "";
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { user } = renderWithStore(<Section section={sectionContent} />);

    await user.click(mobileHeader());
    expect(scrollBySpy).toHaveBeenCalledWith(0, -220);
  });

  it("scroll to unanswered - dated unanswered", async () => {

    // skipped - we don't have this question type currently
    return;


    const inputState = clone(INPUT_STATE);
    inputState.answers.community.datedImprovements = {
      answer1: "",
      answer2: "",
      answer3: "",
      year1: "",
      year2: "",
      year3: "",
    };
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { user } = renderWithStore(<Section section={sectionContent} />);

    await user.click(mobileHeader());
    expect(scrollBySpy).toHaveBeenCalledWith(0, -220);
  });

  it("bottom navigation", async () => {
    const { getByRole, user } = renderWithStore(
      <Section section={sectionContent} />
    );

    await user.click(getByRole("button", { name: "previous section" }));
    expect(surveyStore.getState().currentSectionId).toBe("background");

    await user.click(getByRole("button", { name: "next section" }));
    expect(surveyStore.getState().currentSectionId).toBe("pandp");

    await user.click(getByRole("button", { name: "next section" }));
    expect(surveyStore.getState().currentSectionId).toBe("nature");
  });

  const section = () => document.querySelector(".section")!;
  const questions = () => document.querySelectorAll(".question");
  const mobileHeader = () =>
    document.querySelector(".section .mobile-header div")!;
});
