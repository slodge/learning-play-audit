import {
  sectionsContent,
  SCALE_WITH_COMMENT,
  TEXT_AREA,
  TEXT_FIELD,
  TEXT_WITH_YEAR,
  USER_TYPE_WITH_COMMENT,
  Section,
  Markup,
  Question,
  PERCENTAGE_TYPE_WITH_COMMENT,
} from "learning-play-audit-survey";
import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  TabStopType,
  ShadingType,
  Header,
  Footer,
  HorizontalPositionRelativeFrom,
  convertInchesToTwip,
  VerticalPositionAlign,
  AlignmentType,
  VerticalPositionRelativeFrom,
  TableCell,
  TableRow,
  Table,
  WidthType,
  BorderStyle,
} from "docx";
import {
  REPORT_FOOTER_BASE64,
  REPORT_HEADER_BASE64,
} from "./reportImagesBase64";
import { getCharts, SurveyChart } from "./SurveyCharts";
import {
  DatedQuestionAnswer,
  PhotoDetails,
  PhotosData,
  QuestionAnswer,
  SectionAnswers,
  SurveyAnswers,
} from "./SurveyModel";

const IMAGE_NOT_FOUND = "[Image not found]";

const PAGE_MARGINS = {
  top: convertInchesToTwip(1.6),
  right: convertInchesToTwip(1),
  bottom: convertInchesToTwip(0.5),
  left: convertInchesToTwip(1),
};

const PHOTO_TABLE_CELL_OPTIONS = {
  borders: {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
  },
  margins: {
    marginUnitType: WidthType.DXA,
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
  },
};

export async function exportSurveyAsDocx(
  surveyResponse: SurveyAnswers,
  photosDetails: PhotoDetails[],
  photosData: PhotosData
) {
  const surveyQuestionParagraphs = sectionsContent
    .map((section) => {
      return renderSection(section, surveyResponse[section.id]);
    })
    .flat();

  let photosParagraphs: (Paragraph | Table)[] = [];
  if (photosDetails?.length > 0) {
    const photosTable = new Table({
      rows: photosDetails.map((photoRef) =>
        renderPhotoRow(photoRef.fullsize.key, photoRef.description)
      ),
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    photosParagraphs = [
      new Paragraph({
        text: "Survey Photos",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      photosTable,
    ];
  }

  const charts = await getCharts(surveyResponse);

  // group charts by title for easy access
  const chartsByTitle: { [key: string]: SurveyChart[] } = {};
  charts.forEach((chart) => {
    if (!chartsByTitle[chart.title]) {
      chartsByTitle[chart.title] = [];
    }
    chartsByTitle[chart.title].push(chart);
  });

  const chartsParagraphs = [];
  
  // iterate over chartsByTitle
  for (const title in chartsByTitle) {
    chartsParagraphs.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_2,
        pageBreakBefore: true,
      })
    );

    chartsByTitle[title].forEach((chart) => { 
      chartsParagraphs.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: chart.chart,
              transformation: { height: 300, width: 600 },
            }),
          ],
        })
      );

      chart.labels.forEach((label, index) => {
        chartsParagraphs.push(
          new Paragraph({
            // color from resultColours
            style: "Normal",
            children: [
              new TextRun({
                // round result to nearest integer
                text: `${label}: ${Math.round(chart.results[index])}% - ${chart.statements[index]}`,
                color: chart.resultColours[index].replace("#", ""),
              }),
            ],
          })
        );
      });
    })
  }

  const headers = {
    default: new Header({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              // data: fs.readFileSync("./reportHeader.png"),
              data: Buffer.from(REPORT_HEADER_BASE64, "base64"),
              transformation: { height: 187, width: 794 },
              floating: {
                horizontalPosition: {
                  relative: HorizontalPositionRelativeFrom.PAGE,
                  offset: 0,
                },
                verticalPosition: {
                  relative: VerticalPositionRelativeFrom.PAGE,
                  offset: 0,
                },
              },
            }),
          ],
        }),
      ],
    }),
  };

  const footers = {
    default: new Footer({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              // data: fs.readFileSync("./reportFooter.png"),
              data: Buffer.from(REPORT_FOOTER_BASE64, "base64"),
              transformation: { height: 54, width: 794 },
              floating: {
                horizontalPosition: {
                  relative: HorizontalPositionRelativeFrom.PAGE,
                  offset: 0,
                },
                verticalPosition: {
                  relative: VerticalPositionRelativeFrom.PAGE,
                  offset: 0,
                  align: VerticalPositionAlign.BOTTOM,
                },
              },
            }),
          ],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          style: "FooterText",
          text: "© Learning through Landscapes  |   www.ltl.org.uk",
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          style: "FooterText",
          text: "Registered charity no. in England and Wales 803270 and in Scotland SCO38890",
        }),
      ],
    }),
  };

  function getScaledPhotoDimensions(height: number, width: number) {
    const MAX_PHOTO_WIDTH = 290;
    const scaledHeight = (height * MAX_PHOTO_WIDTH) / width;
    return { height: scaledHeight, width: MAX_PHOTO_WIDTH };
  }

  function renderPhotoRow(photoKey: string, description: string) {
    console.log("renderPhoto params", photoKey, description);
    const photoData = photosData?.[photoKey];
    if (photoData?.data) {
      const { height, width } = photoData.info;
      console.log("renderPhoto dimensions", height, width);

      return new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: photoData.data,
                    transformation: getScaledPhotoDimensions(height, width),
                  }),
                ],
              }),
            ],
            ...PHOTO_TABLE_CELL_OPTIONS,
          }),
          new TableCell({
            children: [new Paragraph({ text: description })],
            ...PHOTO_TABLE_CELL_OPTIONS,
          }),
        ],
      });
    }

    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: IMAGE_NOT_FOUND })],
          ...PHOTO_TABLE_CELL_OPTIONS,
        }),
        new TableCell({
          children: [new Paragraph({ text: description })],
          ...PHOTO_TABLE_CELL_OPTIONS,
        }),
      ],
    });
  }

  return new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, color: "#a7cd45" },
          paragraph: { spacing: { after: 120 } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 20, bold: true },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: "FooterText",
          name: "FooterText",
          basedOn: "Normal",
          next: "Normal",
          run: { color: "999999", size: 16 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: { margin: PAGE_MARGINS },
        },
        headers,
        footers,
        children: [
          new Paragraph({
            text: "Survey Responses",
            heading: HeadingLevel.HEADING_1,
          }),
          ...surveyQuestionParagraphs,
          ...photosParagraphs,
          ...chartsParagraphs,
        ],
      },
    ],
  });
}

function getTextRuns(nodes: Markup[]) {
  return nodes
    .map((node) => {
      if (typeof node === "string") {
        return new TextRun({ text: node });
      }

      if (typeof node === "object" && node && node.tag === "b") {
        return new TextRun({ text: node.content as string, bold: true });
      }
    })
    .filter(Boolean) as TextRun[];
}

export function renderQuestionText(
  questionNumber: number,
  questionText: Markup | Markup[]
) {
  const nodes = questionText instanceof Array ? questionText : [questionText];

  return new Paragraph({
    children: [
      new TextRun({
        text: questionNumber + ":\t",
        bold: true,
      }),
      ...getTextRuns(nodes),
    ],
    tabStops: [{ type: TabStopType.LEFT, position: 500 }],
    indent: { start: 500, hanging: 500 },
    shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
    spacing: { before: 200, after: 50 },
  });
}

function renderSubsectionParagraph(markup: Markup) {
  if (typeof markup === "string") {
    return new Paragraph({ text: markup });
  }

  const { tag, content } = markup;
  if (tag === "h2" && typeof content === "string") {
    return new Paragraph({ text: content, heading: HeadingLevel.HEADING_2 });
  }

  if (tag === "p") {
    const nodes = content instanceof Array ? content : [content];

    return new Paragraph({ children: getTextRuns(nodes) });
  }
}

export function renderSubsectionTitle(title: Markup | Markup[]) {
  return title instanceof Array
    ? title.map(renderSubsectionParagraph)
    : [renderSubsectionParagraph(title)];
}

function renderAnswerWithComment(answer: string, comment: string) {
  let text;
  if (answer && comment) {
    text = answer + "\t" + comment;
  } else if (answer) {
    text = answer;
  } else if (comment) {
    text = comment;
  } else {
    text = "Not answered";
  }

  return new Paragraph({
    text,
    tabStops: [{ type: TabStopType.LEFT, position: 1500 }],
    indent: { start: 1500, hanging: 1500 },
  });
}

function renderQuestionTypeSelectWithComment(
  question: Question,
  questionNumber: number,
  response: QuestionAnswer
) {
  function getAnswer(value: string) {
    switch (value) {
      case "a":
        return "Strongly agree";
      case "b":
        return "Tend to agree";
      case "c":
        return "Tend to disagree";
      case "d":
        return "Strongly disagree";
      default:
        return "Unknown: " + value;
    }
  }

  const answer = response?.answer ? getAnswer(response.answer) : "";
  const comment = response?.comments || "";

  return [
    renderQuestionText(questionNumber, question.text),
    renderAnswerWithComment(answer, comment),
  ];
}

function renderQuestionTypePercentageSelect(
  question: Question,
  questionNumber: number,
  response: QuestionAnswer
) {
  function getAnswer(value: string) {
    switch (value) {
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
        return "Unknown: " + value;
    }
  }

  const answer = response?.answer ? getAnswer(response.answer) : "";
  const comment = response?.comments || "";

  return [
    renderQuestionText(questionNumber, question.text),
    renderAnswerWithComment(answer, comment),
  ];
}

function renderQuestionTypeUserSelect(
  question: Question,
  questionNumber: number,
  response: QuestionAnswer
) {
  function getAnswer(value: string) {
    switch (value) {
      case "a":
        return "Teacher";
      case "b":
        return "Parent";
      case "c":
        return "Pupil";
      case "d":
        return "Other";
      default:
        return "Unknown: " + value;
    }
  }

  function labelTitle(value: string) {
    switch (value) {
      case "a":
        return "Position";
      case "c":
        return "Year group";
      default:
        return "Details";
    }
  }

  const answer = response?.answer ? getAnswer(response.answer) : "";
  const comment = response?.comments
    ? labelTitle(response?.answer) + ": " + response.comments
    : "";

  return [
    renderQuestionText(questionNumber, question.text),
    renderAnswerWithComment(answer, comment),
  ];
}

function renderQuestionTypeText(
  question: Question,
  questionNumber: number,
  response: QuestionAnswer
) {
  return [
    renderQuestionText(questionNumber, question.text),
    new Paragraph({ text: response?.answer || "Not answered" }),
  ];
}

function renderQuestionTypeTextWithYear(
  question: Question,
  questionNumber: number,
  response: DatedQuestionAnswer
): Paragraph[] {
  function yearAnswerRow(answer: string, year: string) {
    if (answer && year) {
      return new Paragraph({
        text: year + "\t" + answer,
        tabStops: [{ type: TabStopType.LEFT, position: 500 }],
        indent: { start: 500, hanging: 500 },
      });
    }
    if (answer) {
      return new Paragraph({ text: answer });
    }
    if (year) {
      return new Paragraph({ text: year });
    }
    return null;
  }

  function questionAnswered() {
    return (
      response.answer1 ||
      response.answer2 ||
      response.answer3 ||
      response.year1 ||
      response.year2 ||
      response.year3
    );
  }

  return [
    renderQuestionText(questionNumber, question.text),
    ...(questionAnswered()
      ? ([
          yearAnswerRow(response.answer1 || "", response.year1 || ""),
          yearAnswerRow(response.answer2 || "", response.year2 || ""),
          yearAnswerRow(response.answer3 || "", response.year3 || ""),
        ].filter(Boolean) as Paragraph[])
      : [new Paragraph({ text: "Not answered" })]),
  ];
}

function renderQuestion(
  question: Question,
  questionIndex: number,
  sectionResponses: SectionAnswers,
  paragraphs: Paragraph[]
) {
  const { type, id } = question;
  const response = sectionResponses[id];

  if (SCALE_WITH_COMMENT === type) {
    paragraphs.splice(
      paragraphs.length,
      0,
      ...renderQuestionTypeSelectWithComment(
        question,
        questionIndex,
        response as QuestionAnswer
      )
    );
  } else if (USER_TYPE_WITH_COMMENT === type) {
    paragraphs.splice(
      paragraphs.length,
      0,
      ...renderQuestionTypeUserSelect(
        question,
        questionIndex,
        response as QuestionAnswer
      )
    );
  } else if (PERCENTAGE_TYPE_WITH_COMMENT === type) {
    paragraphs.splice(
      paragraphs.length,
      0,
      ...renderQuestionTypePercentageSelect(
        question,
        questionIndex,
        response as QuestionAnswer
      )
    );
  } else if (TEXT_AREA === type || TEXT_FIELD === type) {
    paragraphs.splice(
      paragraphs.length,
      0,
      ...renderQuestionTypeText(
        question,
        questionIndex,
        response as QuestionAnswer
      )
    );
  } else if (TEXT_WITH_YEAR === type) {
    paragraphs.splice(
      paragraphs.length,
      0,
      ...renderQuestionTypeTextWithYear(
        question,
        questionIndex,
        response as DatedQuestionAnswer
      )
    );
  } else {
    throw new Error("unknown question type: " + type);
  }
}

function renderSection(section: Section, sectionResponses: SectionAnswers) {
  const docQuestions = [
    new Paragraph({
      text: "Section " + section.number + " - " + section.title,
      heading: HeadingLevel.HEADING_2,
    }),
  ];

  var questionIndex = 0;

  section.subsections.forEach((subsection) => {
    subsection.title &&
      renderSubsectionTitle(subsection.title).forEach(
        (paragraph) => paragraph && docQuestions.push(paragraph)
      );
    subsection.questions.forEach((question) => {
      questionIndex++;
      renderQuestion(question, questionIndex, sectionResponses, docQuestions);
    });
  });

  return docQuestions;
}

export default exportSurveyAsDocx;
