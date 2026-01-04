import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../App.css";
import QuestionSelectWithComment from "./QuestionSelectWithComment";
import QuestionPercentageSelectWithComment from "./QuestionPercentageSelectWithComment";
import QuestionText from "./QuestionText";
import QuestionTextWithYear from "./QuestionTextWithYear";
import QuestionUserSelect from "./QuestionUserSelect";
import SectionBottomNavigation from "./SectionBottomNavigation";
import {
  BACKGROUND,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_WITH_YEAR,
  TEXT_FIELD,
  USER_TYPE_WITH_COMMENT,
  PERCENTAGE_TYPE_WITH_COMMENT,
  sectionQuestions,
  Question,
  Section as SurveySection,
  
} from "learning-play-audit-survey";
import SectionSummary from "./SectionSummary";
import { renderMarkup } from "./RenderMarkup";
import {
  getAnswerCounts,
  getAnswers,
  QuestionAnswer,
} from "../model/SurveyModel";

export interface SectionProps {
  section: SurveySection;
}

function Section({ section }: SectionProps) {
  const SCROLL_OFFSET = 220;

  const sectionId = section.id;

  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    setTotalQuestions(sectionQuestions(section).length);
  }, [section]);

  const answerCounts = useSelector(getAnswerCounts)[sectionId]["answer"];
  const sectionAnswers = useSelector(getAnswers)[sectionId];

  var questionIndex = 0;

  function addQuestion(question: Question) {
    questionIndex += 1;
    const key = sectionId + "-" + question.id;

    if (SCALE_WITH_COMMENT === question.type) {
      return (
        <QuestionSelectWithComment
          key={key}
          sectionId={sectionId}
          question={question}
          questionNumber={questionIndex}
        />
      );
    }

    if (USER_TYPE_WITH_COMMENT === question.type) {
      return (
        <QuestionUserSelect
          key={key}
          sectionId={sectionId}
          question={question}
        />
      );
    }

    if (PERCENTAGE_TYPE_WITH_COMMENT === question.type) {
      return (
        <QuestionPercentageSelectWithComment
          key={key}
          sectionId={sectionId}
          question={question}
          questionNumber={questionIndex}
        />
      );
    }

    if (TEXT_AREA === question.type || TEXT_FIELD === question.type) {
      return (
        <QuestionText
          key={key}
          sectionId={sectionId}
          question={question}
          questionNumber={questionIndex}
          textField={TEXT_FIELD === question.type}
        />
      );
    }

    if (TEXT_WITH_YEAR === question.type) {
      return (
        <QuestionTextWithYear
          key={key}
          sectionId={sectionId}
          question={question}
          questionNumber={questionIndex}
        />
      );
    }

    throw new Error("unknown question type: " + question.type);
  }

  function findUnansweredQuestion(): string | undefined {
    let unansweredQuestionId: string | undefined = undefined;
    sectionQuestions(section).forEach(({ type, id }) => {
      if (unansweredQuestionId) {
        return;
      }

      let hasPreviousValue = false;
      if (type === TEXT_WITH_YEAR) {
        const previousValues = sectionAnswers[id];
        hasPreviousValue =
          Object.values(previousValues).find(
            (value) => value !== null && value.length > 0
          ) !== undefined;
      } else {
        const answer = (sectionAnswers[id] as QuestionAnswer).answer;
        hasPreviousValue =
          answer !== null && answer !== undefined && answer.length > 0;
      }

      if (!hasPreviousValue) {
        unansweredQuestionId = id;
      }
    });
    return unansweredQuestionId;
  }

  function scrollToUnansweredQuestion() {
    if (answerCounts >= totalQuestions) {
      return;
    }

    const unansweredQuestionId = findUnansweredQuestion();
    if (!unansweredQuestionId) {
      console.log("Unanswered question not found");
      return;
    }

    const element = document.getElementById(
      sectionId + "-" + unansweredQuestionId
    );
    window.scrollBy(
      window.scrollX,
      element!.getBoundingClientRect().top - SCROLL_OFFSET
    );
  }

  function addSubsectionDividers(subsections: React.ReactNode[]) {
    const result: React.ReactNode[] = [];
    subsections.forEach((subsection, i) => {
      result.push(subsection);
      if (i < subsections.length - 1) {
        result.push(
          <hr key={i} className="subsection-divider" />
        );
      }
    });
    return result;
  }

  function addQuestionDividers(questions: React.ReactNode[], isBackground:boolean) {
    if (isBackground) {
      return questions;
    }
    const result: React.ReactNode[] = [];
    questions.forEach((question, i) => {
      result.push(question);
      if (i < questions.length - 1) {
        result.push(
          <hr key={i} className="question-divider" />
        );
      }
    });
    return result;
  }

  return (
    <div className={"section survey " + section.id}>
      <div className="mobile-header">
        <SectionSummary
          key={section.id}
          section={section}
          onClick={scrollToUnansweredQuestion}
          totalQuestions={totalQuestions}
        />
      </div>
      <h1 className="title">
        {section.number}. {section.title}
      </h1>
      {addSubsectionDividers(
        section.subsections.map((subsection) => {
          let result = [];
          if (subsection.title) {
            result.push(renderMarkup(subsection.title));
          }
          result.push(
            ...addQuestionDividers(
              subsection.questions.map(addQuestion),
              section.id === BACKGROUND
            )
          );
          return result;
        })
      )}
      {section.id !== BACKGROUND && <hr className="subsection-divider" />}
      <SectionBottomNavigation />
    </div>
  );
}

export default Section;
