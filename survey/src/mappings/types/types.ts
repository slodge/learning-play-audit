
export type Result = {
    section: string;
    statement: string;
    bad: string;
    ok: string;
    good: string;
    considerations: string[];
}

export type SectionAndQuestionPair = {
  section: string,
  question: string,
}

export type ResultMapping = {
  A: SectionAndQuestionPair[],
  B: SectionAndQuestionPair[],
}

export type AllResultMappings = {
  [key: string]: ResultMapping,
}

export const BACKGROUND = "background";
export const SCALE_WITH_COMMENT = "scaleWithComment";
export const USER_TYPE_WITH_COMMENT = "userTypeWithComment";
export const PERCENTAGE_TYPE_WITH_COMMENT = "percentageTypeWithComment";
export const TEXT_AREA = "textArea";
export const TEXT_FIELD = "textField";
export const TEXT_WITH_YEAR = "textWithYear";

export type QuestionType =
  | typeof SCALE_WITH_COMMENT
  | typeof USER_TYPE_WITH_COMMENT
  | typeof PERCENTAGE_TYPE_WITH_COMMENT
  | typeof TEXT_AREA
  | typeof TEXT_FIELD
  | typeof TEXT_WITH_YEAR;

export type Markup =
  | string
  | {
      tag: string;
      content: Markup | Markup[];
    };

export type Question = {
  type: QuestionType;
  id: string;
  text: Markup | Markup[];
  weight?: number;
};

export type SubSection = {
  title?: Markup | Markup[];

  questions: Question[];
};

export type Section = {
  number: number;
  title: string;
  id: string;
  subsections: SubSection[];
};

export type SurveyVersion = {
    version: string,
    sections: Section[],
    results: Result[],
    result_mappings: AllResultMappings
}

export function sectionQuestions(section: Section): Question[] {
  return section.subsections.reduce((questions, subsection) => {
    questions.push(...subsection.questions);
    return questions;
  }, [] as Question[]);
}
