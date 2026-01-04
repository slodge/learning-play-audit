import { SurveyVersion } from "../types/types";
import { result_mappings } from "./result_mappings";
import { all_results } from "./results";
import { sectionsContent } from "./survey";

export const v_0_1_10: SurveyVersion = {
    version: "0.10.0",
    sections: sectionsContent,
    results: all_results,
    result_mappings: result_mappings
}


