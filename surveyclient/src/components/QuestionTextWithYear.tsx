import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes";
import { renderMarkup } from "./RenderMarkup";
import {
  DatedQuestionAnswer,
  DatedQuestionAnswerKey,
  getAnswers,
} from "../model/SurveyModel";
import { Question } from "learning-play-audit-survey";

export interface QuestionTextWithYearProps {
  sectionId: string;
  question: Question;
  questionNumber: number;
}

function QuestionTextWithYear({
  sectionId,
  question,
  questionNumber,
}: QuestionTextWithYearProps) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();

  const questionAnswer = useSelector(getAnswers)[sectionId][
    questionId
  ] as DatedQuestionAnswer;

  const handleChange = (value:string, field: DatedQuestionAnswerKey) => {
    dispatch({ type: SET_ANSWER, sectionId, questionId, field, value });
  };

  function yearAnswerRow(
    answerKey: DatedQuestionAnswerKey,
    yearKey: DatedQuestionAnswerKey,
    answerLabel: string
  ) {
    return (
      <div className="dated-improvement-answer">
        <div className="improvement">
          <label htmlFor={answerKey + "-text"}>{answerLabel}</label>
          <input
            id={answerKey + "-text"}
            type="text"
            name={answerKey + "-text"}
            onChange={(event) => handleChange(event.target.value, answerKey)}
            value={questionAnswer[answerKey]}
          />
        </div>
        <div className="year">
          <label htmlFor={yearKey + "-text"}>Year</label>
          <input
            id={yearKey + "-text"}
            type="text"
            name={yearKey + "-text"}
            onChange={(event) => handleChange(event.target.value, yearKey)}
            value={questionAnswer[yearKey]}
          />
        </div>
      </div>
    );
  }

  return (
    <div id={id} className="question dated">
      <div className="question-line">
        <div className="question-number">{questionNumber}</div>
        <div className="question-text">{renderMarkup(question.text)}</div>
      </div>
      {yearAnswerRow("answer1", "year1", "Improvement 1")}
      {yearAnswerRow("answer2", "year2", "Improvement 2")}
      {yearAnswerRow("answer3", "year3", "Improvement 3")}
    </div>
  );
}

export default QuestionTextWithYear;
