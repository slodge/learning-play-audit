/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedOption"] }] */

import React from "react";
import QuestionPercentageSelectWithComment from "./QuestionPercentageSelectWithComment";
import { QuestionAnswer, surveyStore } from "../model/SurveyModel";
import { renderWithStore } from "./ReactTestUtils";
import { Question, PERCENTAGE_TYPE_WITH_COMMENT } from "learning-play-audit-survey";

describe("component QuestionPercentageSelectWithComment", () => {
  const SECTION_ID = "learning";
  const QUESTION_ID = "classroom";
  const QUESTION_NUMBER = 17;
  const QUESTION_TEXT = "test question text";
  const QUESTION: Question = {
    type: PERCENTAGE_TYPE_WITH_COMMENT,
    id: QUESTION_ID,
    text: QUESTION_TEXT,
  };

  it("initial empty state", () => {
    renderWithStore(
      <QuestionPercentageSelectWithComment
        sectionId={SECTION_ID}
        question={QUESTION}
        questionNumber={QUESTION_NUMBER}
      />
    );

    expect(questionLine().textContent).toStrictEqual(
      QUESTION_NUMBER + QUESTION_TEXT
    );
    checkSelectedOption(null);
  });

  it("selection options", async () => {
    const { user } = renderWithStore(
      <QuestionPercentageSelectWithComment
        sectionId={SECTION_ID}
        question={QUESTION}
        questionNumber={QUESTION_NUMBER}
      />
    );
    checkSelectedOption(null);

    await user.click(toggleButton("a"));
    checkSelectedOption("a");

    await user.click(toggleButton("b"));
    checkSelectedOption("b");

    await user.click(toggleButton("c"));
    checkSelectedOption("c");

    await user.click(toggleButton("d"));
    checkSelectedOption("d");

    await user.click(toggleButton("e"));
    checkSelectedOption("e");

    await user.click(toggleButton("a"));
    checkSelectedOption("a");

    // Test unselection
    await user.click(toggleButton("a"));
    checkSelectedOption(null);
  });

  const questionLine = () => document.querySelector(".question-line")!;
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
});
