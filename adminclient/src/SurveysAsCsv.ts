import {
  sectionQuestions,
  sectionsContent,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_FIELD,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
  Question,
  Section,
  PERCENTAGE_TYPE_WITH_COMMENT,
} from "learning-play-audit-survey";
import { saveAs } from "file-saver";
import {
  DatedQuestionAnswer,
  QuestionAnswer,
  SectionAnswers,
  SurveyResponse,
} from "./model/SurveyModel";

const headerRows = [["", "", ""], ["", "", ""], ["Id", "Name", "Email"]];

export function exportSurveysAsCsv(surveys: SurveyResponse[] = []) {
  if (surveys.length === 0) {
    console.log("No surveys to export");
  }

  // Clone the header rows
  const data = headerRows.map((row) => [...row]);

  sectionsContent.forEach((section) => {
    renderSectionHeader(data, section);
  });

  surveys.forEach((survey) => {
    const response = survey.surveyResponse;
    console.debug(survey);
    const rowData = [survey.id, survey.responderName, survey.responderEmail];

    sectionsContent.forEach((section) => {
      renderSectionAnswers(rowData, section, response[section.id]);
    });

    data.push(rowData);
  });

  var csvData = data.map((row) => row.join(",")).join("\n");
  console.debug(csvData);

  var blob = new Blob([csvData], {
    type: "text/csv",
    endings: "native",
  });
  saveAs(blob, "export.csv");
}

function renderSectionHeader(data: string[][], section: Section) {
  // Contains question and question part headers
  var questionData: string[][] = [[], []];

  function addQuestion({ type, id }: Question) {
    if (SCALE_WITH_COMMENT === type) {
      questionData[0].push(id, "");
      questionData[1].push("answer", "comment");
    } else if (USER_TYPE_WITH_COMMENT === type) {
      questionData[0].push(id, "");
      questionData[1].push("role", "details");
    } else if (PERCENTAGE_TYPE_WITH_COMMENT === type) {
      questionData[0].push(id, "");
      questionData[1].push("answer", "comment");
    } else if (TEXT_AREA === type || TEXT_FIELD === type) {
      questionData[0].push(id);
      questionData[1].push("answer");
    } else if (TEXT_WITH_YEAR === type) {
      questionData[0].push(id, "", "", "", "", "");
      questionData[1].push(
        "answer1",
        "year1",
        "answer2",
        "year2",
        "answer3",
        "year3"
      );
    } else {
      throw new Error("unknown question type: " + type);
    }
  }

  sectionQuestions(section).forEach(addQuestion);

  const sectionData = Array(questionData[0].length).fill("");
  sectionData[0] = section.id;

  data[0].push(...sectionData);
  data[1].push(...questionData[0]);
  data[2].push(...questionData[1]);
}

function renderSectionAnswers(
  rowData: string[],
  section: Section,
  sectionResponse: SectionAnswers
) {
  function addQuestion({ type, id }: Question) {
    const response = sectionResponse[id] || { answer: "", comments: "" };

    if (SCALE_WITH_COMMENT === type || USER_TYPE_WITH_COMMENT === type || PERCENTAGE_TYPE_WITH_COMMENT === type) {
      const simpleResponse = response as QuestionAnswer;
      addAnswers(rowData, simpleResponse.answer, simpleResponse.comments);
    } else if (TEXT_AREA === type || TEXT_FIELD === type) {
      addAnswers(rowData, (response as QuestionAnswer).answer);
    } else if (TEXT_WITH_YEAR === type) {
      const datedResponse = response as DatedQuestionAnswer;
      addAnswers(
        rowData,
        datedResponse.answer1,
        datedResponse.year1,
        datedResponse.answer2,
        datedResponse.year2,
        datedResponse.answer3,
        datedResponse.year3
      );
    } else {
      throw new Error("unknown question type: " + type);
    }
  }

  sectionQuestions(section).forEach(addQuestion);
}

function addAnswers(rowData: string[], ...answers: string[]) {
  rowData.push(...answers.map(escapeString));
}

function escapeString(input: string): string {
  return input === null || input.length === 0
    ? ""
    : '"' + input.replace(/"/g, '""') + '"';
}
