import React from "react";
import SectionSummary from "./SectionSummary";
import { surveyStore } from "../model/SurveyModel";
import { REFRESH_STATE } from "../model/ActionTypes";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";
import rfdc from "rfdc";
import { renderWithStore } from "./ReactTestUtils";
import { Section } from "learning-play-audit-survey";

const clone = rfdc();

const handleClick = jest.fn();

const SECTION_ID = "pandp";
const SECTION_NUMBER = 17;
const SECTION_TITLE = "test section title";
const SECTION: Section = {
  id: SECTION_ID,
  number: SECTION_NUMBER,
  title: SECTION_TITLE,
  subsections: [],
};

const TOTAL_QUESTIONS = 5;

describe("component SectionSummary", () => {
  beforeEach(() => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: { ...INPUT_STATE, currentSectionId: "nature" },
    });
  });

  it("unanswered section", () => {
    const inputState = clone(EMPTY_STATE);
    inputState.answerCounts.pandp.answer = 0;

    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { container } = renderWithStore(
      <SectionSummary
        section={SECTION}
        onClick={handleClick}
        totalQuestions={TOTAL_QUESTIONS}
      />
    );

    expect(container).toHaveTextContent(
      SECTION_NUMBER + SECTION_TITLE + "5 questions remaining0/5"
    );
  });

  it("answered section", () => {
    const inputState = clone(INPUT_STATE);
    inputState.answerCounts.pandp.answer = 5;

    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { container } = renderWithStore(
      <SectionSummary
        section={SECTION}
        onClick={handleClick}
        totalQuestions={TOTAL_QUESTIONS}
      />
    );

    expect(container).toHaveTextContent(
      SECTION_NUMBER + SECTION_TITLE + "0 questions remaining5/5"
    );
  });

  it("incomplete section", () => {
    const inputState = clone(INPUT_STATE);
    inputState.answerCounts.pandp.answer = 4;

    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });
    const { container } = renderWithStore(
      <SectionSummary
        section={SECTION}
        onClick={handleClick}
        totalQuestions={TOTAL_QUESTIONS}
      />
    );

    expect(container).toHaveTextContent(
      SECTION_NUMBER + SECTION_TITLE + "1 question remaining4/5"
    );
  });

  it("unselected section", () => {
    const { container } = renderWithStore(
      <SectionSummary
        section={SECTION}
        onClick={handleClick}
        totalQuestions={TOTAL_QUESTIONS}
      />
    );

    expect(container.querySelector("div")).not.toHaveClass("selected");
  });

  it("selected section", () => {
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: { ...INPUT_STATE, currentSectionId: SECTION_ID },
    });
    const { container } = renderWithStore(
      <SectionSummary
        section={SECTION}
        onClick={handleClick}
        totalQuestions={TOTAL_QUESTIONS}
      />
    );

    expect(container.querySelector("div")).toHaveClass("selected");
  });

  it("click summary", async () => {
    const { container, user } = renderWithStore(
      <SectionSummary
        section={SECTION}
        onClick={handleClick}
        totalQuestions={TOTAL_QUESTIONS}
      />
    );
    expect(handleClick).not.toHaveBeenCalled();

    await user.click(container.querySelector("div")!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

});
