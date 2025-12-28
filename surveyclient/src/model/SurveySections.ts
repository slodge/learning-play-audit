import { sectionsContent } from "learning-play-audit-survey";

// Fixed section ids
export const INTRODUCTION = "introduction";
export const RESULTS = "results";
export const GALLERY = "gallery";
export const SUBMIT = "submit";

export interface SurveySectionSummary {
  title: string;
  id: string;
}

export const SURVEY_SECTIONS: SurveySectionSummary[] = [
  { title: "Introduction", id: INTRODUCTION },
  ...sectionsContent.map(({title, id}) => ({title, id})),
  { title: "Results", id: RESULTS },
  //{ title: "Photos", id: GALLERY },
  { title: "Submit survey", id: SUBMIT },
];
