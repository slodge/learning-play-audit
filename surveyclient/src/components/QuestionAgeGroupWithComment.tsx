import React from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { SET_ANSWER } from "../model/ActionTypes";
import QuestionAddCommentButton from "./QuestionAddCommentButton";
import QuestionAddPhotosButton from "./QuestionAddPhotosButton";
import { renderMarkup } from "./RenderMarkup";
import { getAnswers, QuestionAnswer } from "../model/SurveyModel";
import { Question } from "learning-play-audit-survey";

export interface QuestionAgeGroupWithCommentProps {
  sectionId: string;
  question: Question;
  questionNumber: number;
}

export default function QuestionAgeGroupWithComment({
  sectionId,
  question,
  questionNumber,
}: QuestionAgeGroupWithCommentProps) {
  const questionId = question.id;
  const id = sectionId + "-" + questionId;

  const dispatch = useDispatch();
  const questionAnswer =  useSelector(getAnswers)[sectionId][
    questionId
  ] as QuestionAnswer;

  function handleClick(newValue: string) {
    dispatch({
      type: SET_ANSWER,
      sectionId,
      questionId,
      field: "answer",
      value: questionAnswer.answer === newValue ? "" : newValue,
    });
  }

  function toggleButton(value: string, label: string) {
    return (
      <button
        id={value}
        className={questionAnswer.answer === value ? "selected" : ""}
        onClick={() => handleClick(value)}
        aria-label={label}
      >
        {label}
      </button>
    );
  }

  return (
    <div id={id} className="question select">
      <div className="question-line">
        <div className="question-text">{renderMarkup(question.text)}</div>
      </div>
      <div className="action-row">
        <div className="toggle-button-group" aria-label={questionId}>
          {toggleButton("a", "Early Years")}
          {toggleButton("b", "Primary")}
          {toggleButton("c", "Secondary")}
          {toggleButton("d", "Other")}
        </div>
        <div className="action-button-group">
          <QuestionAddCommentButton
            sectionId={sectionId}
            questionId={questionId}
            questionNumber={questionNumber}
            questionText={question.text}
          />
          <QuestionAddPhotosButton
            sectionId={sectionId}
            questionId={questionId}
            questionNumber={questionNumber}
            questionText={question.text}
          />
        </div>
      </div>
    </div>
  );
}
