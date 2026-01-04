/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import QuestionAddCommentButton from "./QuestionAddCommentButton";
import { QuestionAnswer, surveyStore } from "../model/SurveyModel";
import { SET_ANSWER } from "../model/ActionTypes";
import { renderWithStore } from "./ReactTestUtils";

describe("component QuestionAddCommentButton", () => {
  const SECTION_ID = "pandp";
  const QUESTION_ID = "P01";
  const QUESTION_NUMBER = 17;
  const QUESTION_TEXT = "test question text";

  const IMAGE_NO_COMMENT = "./assets/add_note.svg";
  const IMAGE_WITH_COMMENT = "./assets/add_note_ticked.svg";

  it("initial state - no comment", () => {
    renderWithStore(
      <QuestionAddCommentButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );

    expect(buttonImage()).toHaveAttribute("src", IMAGE_NO_COMMENT);
  });

  it("initial state - with comment", () => {
    surveyStore.dispatch({
      type: SET_ANSWER,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      field: "comments",
      value: "test value",
    });
    renderWithStore(
      <QuestionAddCommentButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );

    expect(buttonImage()).toHaveAttribute("src", IMAGE_WITH_COMMENT);
  });

  it("popup dialog - no comment", async () => {
    const { user } = renderWithStore(
      <QuestionAddCommentButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );

    await user.click(addCommentButton()!);

    expect(questionLine()).toHaveTextContent(QUESTION_NUMBER + QUESTION_TEXT);
    checkCommentValue("");
  });

  it("popup dialog - with comment", async () => {
    surveyStore.dispatch({
      type: SET_ANSWER,
      sectionId: SECTION_ID,
      questionId: QUESTION_ID,
      field: "comments",
      value: "test value",
    });
    const { user } = renderWithStore(
      <QuestionAddCommentButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );

    await user.click(addCommentButton()!);

    expect(questionLine()).toHaveTextContent(QUESTION_NUMBER + QUESTION_TEXT);
    checkCommentValue("test value");
  });

  it("close dialog", async () => {
    const { user } = renderWithStore(
      <QuestionAddCommentButton
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
      />
    );
    await user.click(addCommentButton()!);
    expect(questionLine()).toHaveTextContent(QUESTION_NUMBER + QUESTION_TEXT);

    await user.click(closeButton()!);
    expect(questionLine()).toBeNull();
  });

  const buttonImage = () => document.querySelector(".add-note-button img");
  const addCommentButton = () => document.querySelector(".add-note-button");
  const closeButton = () => document.querySelector(".dialog .save-note-button");
  const questionLine = () => document.querySelector(".dialog .question-line");
  const commentField = () => document.querySelector(".dialog textarea");

  function checkCommentValue(expectedValue: string) {
    expect(commentField()).toHaveTextContent(expectedValue);

    // Check value in model
    expect(
      (
        surveyStore.getState().answers[SECTION_ID][
          QUESTION_ID
        ] as QuestionAnswer
      ).comments
    ).toStrictEqual(expectedValue);
  }
});
