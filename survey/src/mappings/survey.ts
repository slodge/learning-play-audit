// Survey content Copyright 2020 Learning through Landscapes https://www.ltl.org.uk/

import { Question, Section, SurveyVersion } from "./types/types";
import { v_0_1_10 } from "./v_0_1_10/index";

type VersionLookup = {
  [key: string]: SurveyVersion
}

const _current_survey_version: SurveyVersion = v_0_1_10;

const _all_versions: VersionLookup = {}
_all_versions[v_0_1_10.version] = v_0_1_10;

export function survey_versions(): string[] {
  return Object.keys(_all_versions);
}

export function get_survey_version(which: string): SurveyVersion {
  return _all_versions[which];
}

export function current_survey_version(): SurveyVersion {
  return _current_survey_version;
}


