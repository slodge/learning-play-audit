/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkCommentValue"] }] */

import React from "react";
import QuestionCommentDialog from "./QuestionCommentDialog";
import { surveyStore, QuestionAnswer } from "../model/SurveyModel";
import {  SET_ANSWER } from "../model/ActionTypes";
import { renderWithStore } from "./ReactTestUtils";

const closeDialog = jest.fn();

describe("component QuestionCommentDialog", () => {

  const SECTION_ID = "pandp";
  const QUESTION_ID = "P01";
  const QUESTION_NUMBER = 17;
  const QUESTION_TEXT = "test question text";

  it("initial empty state", () => {
    renderWithStore(
      <QuestionCommentDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );

    expect(questionLine()).toHaveTextContent(QUESTION_NUMBER + QUESTION_TEXT);
    checkCommentValue("");
  });

  it("set comment", async () => {
    const { user } = renderWithStore(
      <QuestionCommentDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );
    checkCommentValue("");
    expect(closeDialog).not.toHaveBeenCalled();

    await user.type(commentField(), "test value");
    await user.click(closeButton());

    checkCommentValue("test value");
    expect(closeDialog).toHaveBeenCalledTimes(1);
  });

  it("cancel comment", async () => {
    const { user } = renderWithStore(
      <QuestionCommentDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );
    checkCommentValue("");
    expect(closeDialog).not.toHaveBeenCalled();

    await user.type(commentField(), "test value");
    const backdrop = document.querySelector(
      "#dialog-container div:first-child"
    )!;
    await user.click(backdrop);

    expect(commentField()).toHaveTextContent("test value");

    // Check value in model
    expect(
      (
        surveyStore.getState().answers[SECTION_ID][
          QUESTION_ID
        ] as QuestionAnswer
      ).comments
    ).toBe("");
    expect(closeDialog).toHaveBeenCalledTimes(1);
  });

  it("clear comment", async () => {
    surveyStore.dispatch({
      type: SET_ANSWER,
      sectionId: "pandp",
      questionId: "P01",
      field: "comments",
      value: "test value",
    });
    const { user } = renderWithStore(
      <QuestionCommentDialog
        sectionId={SECTION_ID}
        questionId={QUESTION_ID}
        questionText={QUESTION_TEXT}
        questionNumber={QUESTION_NUMBER}
        closeDialog={closeDialog}
      />
    );
    checkCommentValue("test value");
    expect(closeDialog).not.toHaveBeenCalled();

    await user.clear(commentField());
    await user.click(closeButton());
    checkCommentValue("");
    expect(closeDialog).toHaveBeenCalledTimes(1);
  });

  const commentField = () => document.querySelector(".dialog textarea")!;
  const closeButton = () =>
    document.querySelector(".dialog .save-note-button")!;
  const questionLine = () => document.querySelector(".dialog .question-line")!;

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
