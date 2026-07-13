import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes";
import { renderMarkup } from "./RenderMarkup";
import { getAnswers, QuestionAnswer } from "../model/SurveyModel";
import { Question } from "learning-play-audit-survey";

export interface QuestionTextProps {
  sectionId: string;
  question: Question;
  questionNumber: number;
  textField?: boolean;
}

function QuestionText({
  sectionId,
  question,
  questionNumber,
  textField = false,
}: QuestionTextProps) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();

  const questionAnswer = useSelector(getAnswers)[sectionId][
    questionId
  ] as QuestionAnswer;

  const handleChange = (value: string) => {
    dispatch({
      type: SET_ANSWER,
      sectionId,
      questionId,
      field: "answer",
      value,
    });
  };

  if (textField) {
    return (
      <div id={id} className="question">
        <label htmlFor={id + "-text"}>{renderMarkup(question.text)}</label>
        <input
          id={id + "-text"}
          type="text"
          name={id + "-text"}
          onChange={(event) => handleChange(event.target.value)}
          value={questionAnswer.answer}
        />
      </div>
    );
  }

  return (
    <div id={id} className="question text">
      <div className="question-line">
        <div className="question-number">{questionNumber}</div>
        <div className="question-text">{renderMarkup(question.text)}</div>
      </div>
      <textarea
        onChange={(event) => handleChange(event.target.value)}
        value={questionAnswer.answer}
      />
    </div>
  );
}

export default QuestionText;
