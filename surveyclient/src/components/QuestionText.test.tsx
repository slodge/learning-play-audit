/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkTextValue"] }] */

import React from "react";
import QuestionText from "./QuestionText";
import { QuestionAnswer, surveyStore } from "../model/SurveyModel";
import { renderWithStore } from "./ReactTestUtils";
import { Question, TEXT_FIELD } from "learning-play-audit-survey";

describe("component QuestionText", () => {
  const SECTION_ID = "pandp";
  const QUESTION_ID = "P01";
  const QUESTION_NUMBER = 17;
  const QUESTION_TEXT = "test question text";
  const QUESTION: Question = {
    id: QUESTION_ID,
    text: QUESTION_TEXT,
    type: TEXT_FIELD,
  };
  const PHOTO_BUTTON_TEXT = "add photoAdd Relevant Photo?";

  it("initial empty state - text area", () => {
    renderWithStore(
      <QuestionText
        sectionId={SECTION_ID}
        question={QUESTION}
        questionNumber={QUESTION_NUMBER}
        textField={false}
      />
    );

    expect(question()).toHaveTextContent(
      QUESTION_NUMBER + QUESTION_TEXT + PHOTO_BUTTON_TEXT
    );
    expect(textarea()).toHaveTextContent("");
  });

  it("initial empty state - text area (default)", () => {
    renderWithStore(
      <QuestionText
        sectionId={SECTION_ID}
        question={QUESTION}
        questionNumber={QUESTION_NUMBER}
      />
    );

    expect(question()).toHaveTextContent(
      QUESTION_NUMBER + QUESTION_TEXT + PHOTO_BUTTON_TEXT
    );
    expect(textarea()).toHaveTextContent("");
  });

  it("initial empty state - text field", () => {
    renderWithStore(
      <QuestionText
        sectionId={SECTION_ID}
        question={QUESTION}
        questionNumber={QUESTION_NUMBER}
        textField={true}
      />
    );

    expect(question()).toHaveTextContent(QUESTION_TEXT);
    expect(textfield()).toHaveDisplayValue("");
  });

  it("set content - text area", async () => {
    const { user } = renderWithStore(
      <QuestionText
        sectionId={SECTION_ID}
        question={QUESTION}
        questionNumber={QUESTION_NUMBER}
        textField={false}
      />
    );

    await user.type(textarea(), "test value");
    expect(textarea()).toHaveTextContent("test value");
    checkModelValue("test value");

    await user.clear(textarea());
    expect(textarea()).toHaveTextContent("");
    checkModelValue("");
  });

  it("set content - text field", async () => {
    const { user } = renderWithStore(
      <QuestionText
        sectionId={SECTION_ID}
        question={QUESTION}
        questionNumber={QUESTION_NUMBER}
        textField={true}
      />
    );

    await user.type(textfield(), "test value");
    expect(textfield()).toHaveDisplayValue("test value");
    checkModelValue("test value");

    await user.clear(textfield());
    expect(textfield()).toHaveDisplayValue("");
    checkModelValue("");
  });

  const question = () => document.querySelector(".question");
  const textfield = () => document.querySelector(".question input")!;
  const textarea = () => document.querySelector(".question textarea")!;

  function checkModelValue(expectedText: string) {
    expect(
      (
        surveyStore.getState().answers[SECTION_ID][
          QUESTION_ID
        ] as QuestionAnswer
      ).answer
    ).toStrictEqual(expectedText);
  }
});
