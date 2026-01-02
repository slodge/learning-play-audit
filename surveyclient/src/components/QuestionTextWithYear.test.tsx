/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkTextValues"] }] */

import React from "react";
import QuestionTextWithYear from "./QuestionTextWithYear";
import { surveyStore } from "../model/SurveyModel";
import { renderWithStore } from "./ReactTestUtils";
import { Question, TEXT_WITH_YEAR } from "learning-play-audit-survey";

describe("component QuestionTextWithYear", () => {

  it("skipped - we don't have any of these questions currently", () => {
  });

  return;
  
  const SECTION_ID = "pandp";
  const QUESTION_ID = "P01";
  const QUESTION_NUMBER = 17;
  const QUESTION_TEXT = "test question text";
  const QUESTION: Question = {
    type: TEXT_WITH_YEAR,
    id: QUESTION_ID,
    text: QUESTION_TEXT,
  };
  const PHOTO_BUTTON_TEXT = "add photoAdd Relevant Photo?";

  it("initial empty state", () => {
    const { container } = renderWithStore(
      <QuestionTextWithYear
        sectionId={SECTION_ID}
        question={QUESTION}
        questionNumber={QUESTION_NUMBER}
      />
    );

    expect(container.querySelector(".question-line")).toHaveTextContent(
      QUESTION_NUMBER + QUESTION_TEXT + PHOTO_BUTTON_TEXT
    );
    checkTextValues("", "", "", "", "", "");
  });

  it("set content - all fields", async () => {
    const { user } = renderWithStore(
      <QuestionTextWithYear
        sectionId={SECTION_ID}
        question={QUESTION}
        questionNumber={QUESTION_NUMBER}
      />
    );
    checkTextValues("", "", "", "", "", "");

    await user.type(textfield("answer1-text"), "test value answer1");
    await user.type(textfield("year1-text"), "test value year1");
    await user.type(textfield("answer2-text"), "test value answer2");
    await user.type(textfield("year2-text"), "test value year2");
    await user.type(textfield("answer3-text"), "test value answer3");
    await user.type(textfield("year3-text"), "test value year3");
    checkTextValues(
      "test value answer1",
      "test value year1",
      "test value answer2",
      "test value year2",
      "test value answer3",
      "test value year3"
    );

    await user.clear(textfield("answer1-text"));
    await user.clear(textfield("year1-text"));
    await user.clear(textfield("answer2-text"));
    await user.clear(textfield("year2-text"));
    await user.clear(textfield("answer3-text"));
    await user.clear(textfield("year3-text"));
    checkTextValues("", "", "", "", "", "");
  });

  const textfield = (id: string) =>
    document.querySelector(".question input#" + id)!;

  function checkTextValues(
    expectedAnswer1: string,
    expectedYear1: string,
    expectedAnswer2: string,
    expectedYear2: string,
    expectedAnswer3: string,
    expectedYear3: string
  ) {
    // Check visible selection
    expect(textfield("answer1-text")).toHaveDisplayValue(expectedAnswer1);
    expect(textfield("year1-text")).toHaveDisplayValue(expectedYear1);
    expect(textfield("answer2-text")).toHaveDisplayValue(expectedAnswer2);
    expect(textfield("year2-text")).toHaveDisplayValue(expectedYear2);
    expect(textfield("answer3-text")).toHaveDisplayValue(expectedAnswer3);
    expect(textfield("year3-text")).toHaveDisplayValue(expectedYear3);

    // Check value in model
    expect(
      surveyStore.getState().answers[SECTION_ID][QUESTION_ID]
    ).toStrictEqual({
      answer1: expectedAnswer1,
      answer2: expectedAnswer2,
      answer3: expectedAnswer3,
      year1: expectedYear1,
      year2: expectedYear2,
      year3: expectedYear3,
    });
  }
});
