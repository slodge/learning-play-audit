import {
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  TabStopType,
  TextRun,
} from "docx";
import exportSurveyAsDocx, {
  renderQuestionText,
  renderSubsectionTitle,
} from "./SurveyAsDoc";
import { TEST_ANSWERS } from "./TestUtils";
import fs from "fs";
import { PhotosData } from "./SurveyModel";
import { OutputInfo } from "sharp";

// SORRY ... these tests require a lot of work to get them working... so left for now

describe("exportSurveyAsDocx", () => {
  const SURVEY = {
    responderName: "",
    __typename: "SurveyResponse",
    photos: [
      {
        bucket: "ltlsurvey-dev-surveyresources",
        fullsize: {
          width: 81,
          uploadKey: null,
          key: "surveys/ba80fbb1-d612-4b54-ae4c-203d1b122f4c/photos/48d6dd87-0df1-4a26-a033-aaaaaaaaaaaa",
          height: 117,
        },
        description: "test photo1",
      },
      {
        bucket: "ltlsurvey-dev-surveyresources",
        fullsize: {
          width: 81,
          uploadKey: null,
          key: "surveys/ba80fbb1-d612-4b54-ae4c-203d1b122f4c/photos/48d6dd87-0df1-4a26-a033-bbbbbbbbbbbb",
          height: 117,
        },
        description: "test photo2",
      },
    ],
    surveyResponse: TEST_ANSWERS,
    responderEmail: "ltluserdev@demonsoft.org",
    updatedAt: "2022-02-11T08:53:54.350Z",
    schoolName: "",
    createdAt: "2022-02-11T08:53:54.350Z",
    surveyVersion: "0.9.0",
    uploadState: "Pending upload",
    id: "5909e7e2-84ab-4ce3-9446-ceaefcd672cc",
  };

  const PHOTODATA: PhotosData = {
    "surveys/ba80fbb1-d612-4b54-ae4c-203d1b122f4c/photos/48d6dd87-0df1-4a26-a033-aaaaaaaaaaaa":
      {
        data: fs.readFileSync("src/testImage.jpg"),
        info: { width: 81, height: 117 } as OutputInfo,
      },
    "surveys/ba80fbb1-d612-4b54-ae4c-203d1b122f4c/photos/48d6dd87-0df1-4a26-a033-bbbbbbbbbbbb":
      {
        data: fs.readFileSync("src/testImage.jpg"),
        info: { width: 81, height: 117 } as OutputInfo,
      },
  };

  it("render document", async () => {
    const document = await exportSurveyAsDocx(
      SURVEY.surveyResponse,
      SURVEY.photos,
      PHOTODATA
    );
    await Packer.toBuffer(document).then((buffer) => {
      return fs.writeFileSync("test.docx", buffer);
    });
  });
});

describe("renderSubsectionTitle", () => {
  it("simple paragraph", () => {
    expect(renderSubsectionTitle({ tag: "p", content: "test text" })).toEqual([
      new Paragraph({ children: [new TextRun({ text: "test text" })] }),
    ]);
  });

  it("heading paragraph", () => {
    expect(renderSubsectionTitle({ tag: "h2", content: "Heading" })).toEqual([
      new Paragraph({ text: "Heading", heading: HeadingLevel.HEADING_2 }),
    ]);
  });

  it("array paragraph", () => {
    expect(
      renderSubsectionTitle({ tag: "p", content: ["test text1", "test text2"] })
    ).toEqual([
      new Paragraph({
        children: [
          new TextRun({ text: "test text1" }),
          new TextRun({ text: "test text2" }),
        ],
      }),
    ]);
  });

  it("tree paragraph", () => {
    expect(
      renderSubsectionTitle({
        tag: "p",
        content: { tag: "b", content: "Bold paragraph" },
      })
    ).toEqual([
      new Paragraph({
        children: [new TextRun({ text: "Bold paragraph", bold: true })],
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
      })
    ).toEqual([
      new Paragraph({
        children: [
          new TextRun({ text: "Paragraph with" }),
          new TextRun({ text: "bold text", bold: true }),
          new TextRun({ text: "in the middle" }),
        ],
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
      ])
    ).toEqual([
      new Paragraph({ text: "Heading", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({
        children: [
          new TextRun({ text: "Paragraph with" }),
          new TextRun({ text: "bold text", bold: true }),
          new TextRun({ text: "in the middle" }),
        ],
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
        tabStops: [{ type: TabStopType.LEFT, position: 500 }],
        indent: { start: 500, hanging: 500 },
        shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
        spacing: { before: 200, after: 50 },
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
        tabStops: [{ type: TabStopType.LEFT, position: 500 }],
        indent: { start: 500, hanging: 500 },
        shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
        spacing: { before: 200, after: 50 },
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
        tabStops: [{ type: TabStopType.LEFT, position: 500 }],
        indent: { start: 500, hanging: 500 },
        shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
        spacing: { before: 200, after: 50 },
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
        tabStops: [{ type: TabStopType.LEFT, position: 500 }],
        indent: { start: 500, hanging: 500 },
        shading: { type: ShadingType.CLEAR, fill: "D0D0D0" },
        spacing: { before: 200, after: 50 },
      })
    );
  });
});
