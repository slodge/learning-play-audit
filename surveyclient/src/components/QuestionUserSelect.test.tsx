/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedOption", "checkCommentValue"] }] */

import React from "react";
import QuestionUserSelect from "./QuestionUserSelect";
import { QuestionAnswer, surveyStore } from "../model/SurveyModel";
import { renderWithStore } from "./ReactTestUtils";
import { Question, USER_TYPE_WITH_COMMENT } from "learning-play-audit-survey";

// Skipped this question type removed now
describe.skip("component QuestionUserSelect", () => {
  const SECTION_ID = "background";
  const QUESTION_ID = "position";
  const QUESTION: Question = {
    type: USER_TYPE_WITH_COMMENT,
    id: QUESTION_ID,
    text: "",
  };

  it("initial empty state", () => {
    renderWithStore(
      <QuestionUserSelect sectionId={SECTION_ID} question={QUESTION} />
    );

    checkSelectedOption(null);
    checkCommentLabel("Details");
  });

  it("selection options", () => {
    renderWithStore(
      <QuestionUserSelect sectionId={SECTION_ID} question={QUESTION} />
    );
    checkSelectedOption(null);
    checkCommentLabel("Details");

    // Teacher
    selectOption("a");
    checkSelectedOption("a");
    checkCommentLabel("Position");

    // Parent
    selectOption("b");
    checkSelectedOption("b");
    checkCommentLabel("Details");

    // Pupil
    selectOption("c");
    checkSelectedOption("c");
    checkCommentLabel("Year group");

    // Other
    selectOption("d");
    checkSelectedOption("d");
    checkCommentLabel("Details");

    selectOption("a");
    checkSelectedOption("a");
    checkCommentLabel("Position");

    // Test unselection
    selectOption("a");
    checkSelectedOption("");
    checkCommentLabel("Details");
  });

  it("set comment", async () => {
    const { user } = renderWithStore(
      <QuestionUserSelect sectionId={SECTION_ID} question={QUESTION} />
    );
    checkCommentValue("");

    await user.type(commentField(), "test value");
    checkCommentValue("test value");

    await user.clear(commentField());
    checkCommentValue("");
  });

  const commentLabel = () =>
    document.querySelector(".question .details-column label");
  const commentField = () =>
    document.querySelector(".question .details-column input")!;
  const toggleButtons = () =>
    document.querySelectorAll(".toggle-button-group button");
  const toggleButton = (id: string) =>
    document.querySelector(".toggle-button-group button#" + id)!;

  function checkSelectedOption(expectedOption: string | null) {
    // Check visible selection
    const buttons = toggleButtons();
    expect(buttons).toHaveLength(4);
    buttons.forEach((button) => {
      if (button.getAttribute("id") === expectedOption) {
        expect(button).toHaveClass("selected");
      } else {
        expect(button).not.toHaveClass("selected");
      }
    });

    // Check value in model
    expect(
      (
        surveyStore.getState().answers[SECTION_ID][
          QUESTION_ID
        ] as QuestionAnswer
      ).answer
    ).toStrictEqual(expectedOption ? expectedOption : "");
  }

  function checkCommentLabel(expectedValue: string) {
    expect(commentLabel()).toHaveTextContent(expectedValue);
  }

  function checkCommentValue(expectedValue: string) {
    expect(commentField()).toHaveDisplayValue(expectedValue);
  }

  function selectOption(option: string) {
    toggleButton(option).dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );
  }
});
