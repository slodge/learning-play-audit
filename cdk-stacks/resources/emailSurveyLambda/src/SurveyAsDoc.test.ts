import {
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  TextRun,
} from "docx";
import exportSurveyAsDocx, {
  renderQuestionText,
  renderSubsectionTitle,
} from "./SurveyAsDoc";
import { TEST_ANSWERS } from "./TestUtils";
import fs from "fs";
import { SurveyResponse } from "./SurveyModel";
import { current_survey_version } from "learning-play-audit-survey";

describe("exportSurveyAsDocx", () => {
  const SURVEY: SurveyResponse = {
    responderName: "",
    __typename: "SurveyResponse",
    surveyResponse: TEST_ANSWERS,
    responderEmail: "ltluserdev@demonsoft.org",
    updatedAt: "2022-02-11T08:53:54.350Z",
    schoolName: "",
    createdAt: "2022-02-11T08:53:54.350Z",
    surveyVersion: "0.9.0",
    id: "5909e7e2-84ab-4ce3-9446-ceaefcd672cc",
    state: "Complete"
  };

  it("render document", async () => {
    const document = await exportSurveyAsDocx(
      current_survey_version(),
      SURVEY.surveyResponse,
    );
    await Packer.toBuffer(document).then((buffer) => {
      return fs.writeFileSync("test.docx", buffer);
    });
  });
});

describe("renderSubsectionTitle", () => {
  it("simple paragraph", () => {
    expect(renderSubsectionTitle({ tag: "p", content: "test text" }, false)).toEqual([
      new Paragraph({ children: [new TextRun({ text: "test text" })], spacing: { after: 120 } }),
    ]);
  });

  it("simple paragraph with page break", () => {
    expect(renderSubsectionTitle({ tag: "p", content: "test text" }, true)).toEqual([
      new Paragraph({ 
        children: [new TextRun({ text: "test text" })], 
        spacing: { after: 120 },
        pageBreakBefore: true
       }),
    ]);
  });

  it("heading paragraph", () => {
    expect(renderSubsectionTitle({ tag: "h2", content: "Heading" }, false)).toEqual([
      new Paragraph({ text: "Heading", heading: HeadingLevel.HEADING_2 }),
    ]);
  });

  it("array paragraph", () => {
    expect(
      renderSubsectionTitle({ tag: "p", content: ["test text1", "test text2"] }, false)
    ).toEqual([
      new Paragraph({
        children: [
          new TextRun({ text: "test text1" }),
        ],
        pageBreakBefore: false,
        spacing: { after: 120 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "test text2" }),
        ],
        pageBreakBefore: false,
        spacing: { after: 120 }
      }),
    ]);
  });

  it("tree paragraph", () => {
    expect(
      renderSubsectionTitle({
        tag: "p",
        content: { tag: "b", content: "Bold paragraph" },
      }, false)
    ).toEqual([
      new Paragraph({
        children: [new TextRun({ text: "Bold paragraph", bold: true })],
        pageBreakBefore: false,
        spacing: { after: 120 }
      }),
    ]);
  });

  it("tree array paragraph", () => {
    expect(
      renderSubsectionTitle({
        tag: "p",
        content: [
          "Paragraph with",
          { tag: "b", content: "bold text" },
          "in the middle",
        ],
      }, false)
    ).toEqual([
      new Paragraph({
        children: [
          new TextRun({ text: "Paragraph with" }),
        ],
        pageBreakBefore: false,
        spacing: { after: 120 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "bold text", bold: true }),
        ],
        pageBreakBefore: false,
        spacing: { after: 120 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "in the middle" }),
        ],
        pageBreakBefore: false,
        spacing: { after: 120 }
      }),
    ]);
  });

  it("paragraph array", () => {
    expect(
      renderSubsectionTitle([
        { tag: "h2", content: "Heading" },
        {
          tag: "p",
          content: [
            "Paragraph with",
            { tag: "b", content: "bold text" },
            "in the middle",
          ],
        },
      ], false)
    ).toEqual([
      new Paragraph({ text: "Heading", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({
        children: [
          new TextRun({ text: "Paragraph with" }),
        ],
        pageBreakBefore: false,
        spacing: { after: 120 }
      }),
     new Paragraph({
        children: [
          new TextRun({ text: "bold text", bold: true }),
        ],
        pageBreakBefore: false,
        spacing: { after: 120 }
      }),
     new Paragraph({
        children: [
          new TextRun({ text: "in the middle" }),
        ],
        pageBreakBefore: false,
        spacing: { after: 120 }
      }),
    ]);
  });
});

describe("renderQuestionText", () => {
  it("simple paragraph", () => {
    expect(renderQuestionText(3, "test text")).toEqual(
      new Paragraph({
        children: [
          new TextRun({ text: "3:\t", bold: true }),
          new TextRun({ text: "test text" }),
        ],
        shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
        spacing: { before: 200, after: 50 },
        keepNext: true
      })
    );
  });

  it("bold paragraph", () => {
    expect(
      renderQuestionText(3, { tag: "b", content: "Bold paragraph" })
    ).toEqual(
      new Paragraph({
        children: [
          new TextRun({ text: "3:\t", bold: true }),
          new TextRun({ text: "Bold paragraph", bold: true }),
        ],
        shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
        spacing: { before: 200, after: 50 },
        keepNext: true
      })
    );
  });

  it("array paragraph", () => {
    expect(renderQuestionText(3, ["test text1", "test text2"])).toEqual(
      new Paragraph({
        children: [
          new TextRun({ text: "3:\t", bold: true }),
          new TextRun({ text: "test text1" }),
          new TextRun({ text: "test text2" }),
        ],
        shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
        spacing: { before: 200, after: 50 },
        keepNext: true
      })
    );
  });

  it("array paragraph with bold", () => {
    expect(
      renderQuestionText(3, [
        "Paragraph with",
        { tag: "b", content: "bold text" },
        "in the middle",
      ])
    ).toEqual(
      new Paragraph({
        children: [
          new TextRun({ text: "3:\t", bold: true }),
          new TextRun({ text: "Paragraph with" }),
          new TextRun({ text: "bold text", bold: true }),
          new TextRun({ text: "in the middle" }),
        ],
        shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
        spacing: { before: 200, after: 50 },
        keepNext: true
      })
    );
  });
});
