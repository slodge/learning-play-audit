import React from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import {
  sectionsContent,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_FIELD,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
  PERCENTAGE_TYPE_WITH_COMMENT,
  Section as SurveySection,
  Question,
} from "learning-play-audit-survey";
import Box from "@material-ui/core/Box";
import { renderMarkup } from "./RenderMarkup";
import {
  DatedQuestionAnswer,
  DatedQuestionAnswerKey,
  QuestionAnswer,
  SectionAnswers,
  SurveyResponse,
} from "./model/SurveyModel";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    // position: "absolute",
    // width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  photo: {
    height: "50px",
  },
  answer: {
    color: "green",
  },
  comment: {
    color: "red",
  },
  responsesGrid: {
    border: "#d3d3d3 thin solid",
    margin: "5px",
    borderCollapse: "collapse",
    width: "90%",
    tableLayout: "fixed",
    "& td": {
      border: "#d3d3d3 thin solid",
      padding: "5px",
      height: "15px",
    },
    "& td.response-no": {
      width: "1em",
      textAlign: "center",
    },
    "& td.scale-value": {
      width: "8em",
    },
    "& td.user-type": {
      width: "5em",
    },
    "& td.year": {
      width: "3em",
      textAlign: "center",
    },
  },
  questionText: {
    paddingBottom: "5px",
  },
  question: {
    paddingBottom: "15px",
  },
}));

function getResponseNumberCell(
  responses: (QuestionAnswer | DatedQuestionAnswer)[],
  responseNumber: number
) {
  return responses.length > 1 ? (
    <td className="response-no">{responseNumber}</td>
  ) : (
    <></>
  );
}

interface QuestionSelectWithCommentProps {
  question: Question;
  questionNumber: number;
  responses: QuestionAnswer[];
}

function QuestionSelectWithComment({
  question,
  questionNumber,
  responses,
}: QuestionSelectWithCommentProps) {
  const classes = useStyles();

  function hasComment(response: QuestionAnswer) {
    return response.comments !== null && response.comments.length > 0;
  }

  function getAnswer(response: QuestionAnswer) {
    switch (response.answer) {
      case null:
      case "":
        return "";
      case "a":
        return "strongly agree";
      case "b":
        return "tend to agree";
      case "c":
        return "tend to disagree";
      case "d":
        return "strongly disagree";
      default:
        return "unknown: " + response.answer;
    }
  }

  return (
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionText}>
          {questionNumber}: {renderMarkup(question.text)}
        </div>
      </Box>
      <table className={classes.responsesGrid}>
        <tbody>
          {responses.map((response, i) => {
            return (
              <tr key={"" + i}>
                {getResponseNumberCell(responses, i + 1)}
                <td className="scale-value">
                  {response ? getAnswer(response) : <></>}
                </td>
                <td>
                  {response && hasComment(response) ? response.comments : <></>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface QuestionPercentageWithCommentProps {
  question: Question;
  questionNumber: number;
  responses: QuestionAnswer[];
}

function QuestionPercentageWithComment({
  question,
  questionNumber,
  responses,
}: QuestionPercentageWithCommentProps) {
  const classes = useStyles();

  function hasComment(response: QuestionAnswer) {
    return response.comments !== null && response.comments.length > 0;
  }

  function getAnswer(response: QuestionAnswer) {
    switch (response.answer) {
      case null:
      case "":
        return "";
      case "a":
        return "none";
      case "b":
        return "a little (<5%)";
      case "c":
        return "some (5% to 20%)";
      case "d":
        return "lots (20% to 50%)";
      case "e":
        return "most (>50%)";
      default:
        return "unknown: " + response.answer;
    }
  }

  return (
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionText}>
          {questionNumber}: {renderMarkup(question.text)}
        </div>
      </Box>
      <table className={classes.responsesGrid}>
        <tbody>
          {responses.map((response, i) => {
            return (
              <tr key={"" + i}>
                {getResponseNumberCell(responses, i + 1)}
                <td className="scale-value">
                  {response ? getAnswer(response) : <></>}
                </td>
                <td>
                  {response && hasComment(response) ? response.comments : <></>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface QuestionUserSelectProps {
  question: Question;
  questionNumber: number;
  responses: QuestionAnswer[];
}

function QuestionUserSelect({
  question,
  questionNumber,
  responses,
}: QuestionUserSelectProps) {
  const classes = useStyles();

  function getAnswer(response: QuestionAnswer) {
    switch (response.answer) {
      case null:
      case "":
        return "";
      case "a":
        return "teacher";
      case "b":
        return "parent";
      case "c":
        return "pupil";
      case "d":
        return "other";
      default:
        return "unknown: " + response.answer;
    }
  }

  function labelTitle(response: QuestionAnswer) {
    switch (response.answer) {
      case "a":
        return "Position";
      case "c":
        return "Year group";
      default:
        return "Details";
    }
  }
  return (
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionText}>
          {questionNumber}: {renderMarkup(question.text)}
        </div>
      </Box>
      <table className={classes.responsesGrid}>
        <tbody>
          {responses.map((response, i) => {
            return (
              <tr key={"" + i}>
                {getResponseNumberCell(responses, i + 1)}
                <td className="user-type">{getAnswer(response)}</td>
                <td>{labelTitle(response) ? response.comments : <></>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface QuestionTextProps {
  question: Question;
  questionNumber: number;
  responses: QuestionAnswer[];
}

function QuestionText({
  question,
  questionNumber,
  responses,
}: QuestionTextProps) {
  const classes = useStyles();

  function getAnswer(response: QuestionAnswer) {
    return response.answer;
  }

  return (
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionText}>
          {questionNumber}: {renderMarkup(question.text)}
        </div>
      </Box>
      <table className={classes.responsesGrid}>
        <tbody>
          {responses.map((response, i) => {
            return (
              <tr key={"" + i}>
                {getResponseNumberCell(responses, i + 1)}
                <td>{getAnswer(response)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface QuestionTextWithYearProps {
  question: Question;
  questionNumber: number;
  responses: DatedQuestionAnswer[];
}

function QuestionTextWithYear({
  question,
  questionNumber,
  responses,
}: QuestionTextWithYearProps) {
  const classes = useStyles();

  function yearAnswerRow(
    answerKey: DatedQuestionAnswerKey,
    responseNumber: number,
    answer: string,
    year: string
  ) {
    if (!answer && !year) {
      return null;
    }
    return (
      <tr key={`${responseNumber}${answerKey}`}>
        {getResponseNumberCell(responses, responseNumber)}
        <td>{answer || ""}</td>
        <td className="year">{year || ""}</td>
      </tr>
    );
  }

  return (
    <div className={classes.question}>
      <Box flexDirection="row">
        <div className={classes.questionText}>
          {questionNumber}: {renderMarkup(question.text)}
        </div>
      </Box>
      <table className={classes.responsesGrid}>
        <tbody>
          {responses.map((response, i) =>
            [
              yearAnswerRow("answer1", i + 1, response.answer1, response.year1),
              yearAnswerRow("answer2", i + 1, response.answer2, response.year2),
              yearAnswerRow("answer3", i + 1, response.answer3, response.year3),
            ].filter(Boolean)
          )}
        </tbody>
      </table>
    </div>
  );
}

interface SectionProps {
  section: SurveySection;
  sectionResponses: SectionAnswers[];
}

function Section({ section, sectionResponses }: SectionProps) {
  const sectionId = section.id;

  var questionIndex = 0;
  function addQuestion(question: Question) {
    questionIndex += 1;
    const { type, id } = question;
    const key = sectionId + "-" + id;
    const responses = sectionResponses.map(
      (sectionResponse) => sectionResponse[id]
    );

    if (SCALE_WITH_COMMENT === type) {
      return (
        <QuestionSelectWithComment
          key={key}
          question={question}
          questionNumber={questionIndex}
          responses={responses as QuestionAnswer[]}
        />
      );
    }

    if (USER_TYPE_WITH_COMMENT === type) {
      return (
        <QuestionUserSelect
          key={key}
          question={question}
          questionNumber={questionIndex}
          responses={responses as QuestionAnswer[]}
        />
      );
    }

    if (PERCENTAGE_TYPE_WITH_COMMENT === type) {
      return (
        <QuestionPercentageWithComment
          key={key}
          question={question}
          questionNumber={questionIndex}
          responses={responses as QuestionAnswer[]}
        />
      );
    }

    if (TEXT_AREA === type || TEXT_FIELD === type) {
      return (
        <QuestionText
          key={key}
          question={question}
          questionNumber={questionIndex}
          responses={responses as QuestionAnswer[]}
        />
      );
    }

    if (TEXT_WITH_YEAR === type) {
      return (
        <QuestionTextWithYear
          key={key}
          question={question}
          questionNumber={questionIndex}
          responses={responses as DatedQuestionAnswer[]}
        />
      );
    }

    throw new Error("unknown question type: " + type);
  }

  return (
    <Box flexDirection="column">
      <h1>
        Section {section.number} - {section.title}
      </h1>
      {section.subsections.map((subsection) => {
        let result = [];
        if (subsection.title) {
          result.push(renderMarkup(subsection.title));
        }
        result.push(...subsection.questions.map(addQuestion));
        return result;
      })}
    </Box>
  );
}

interface SurveyResponsesProps {
  id: string;
  surveys: SurveyResponse[];
}

function SurveyResponses({ id, surveys = [] }: SurveyResponsesProps) {
  const classes = useStyles();

  if (surveys.length > 0) {
    surveys.forEach((item) => {
      console.debug(item.surveyResponse);
    });
  }

  function renderSurveys() {
    const responses = surveys.map((item) => item.surveyResponse);
    return sectionsContent.map((section) => {
      return (
        <Section
          key={section.id}
          section={section}
          sectionResponses={responses.map((response) => response[section.id])}
        />
      );
    });
  }

  return (
    <div className={classes.paper} id={id}>
      {surveys.length > 0 ? renderSurveys() : <></>}
    </div>
  );
}

export default SurveyResponses;
