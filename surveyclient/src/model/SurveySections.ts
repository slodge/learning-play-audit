import { current_survey_version } from "learning-play-audit-survey";

// Fixed section ids
export const INTRODUCTION = "introduction";
export const RESULTS = "results";
export const SUBMIT = "submit";

export interface SurveySectionSummary {
  title: string;
  id: string;
}

export const SURVEY_SECTIONS: SurveySectionSummary[] = [
  { title: "Introduction", id: INTRODUCTION },
  ...current_survey_version().sections.map(({title, id}) => ({title, id})),
  { title: "Results", id: RESULTS },
  { title: "Submit survey", id: SUBMIT },
];
