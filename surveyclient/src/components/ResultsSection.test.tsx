import React from "react";
import ResultsSection from "./ResultsSection";
import { QuestionAnswer, surveyStore } from "../model/SurveyModel";
import { REFRESH_STATE, SET_CURRENT_SECTION } from "../model/ActionTypes";
import { INPUT_STATE } from "../model/TestUtils";
import Chart from "chart.js";
import rfdc from "rfdc";
import { renderWithStore } from "./ReactTestUtils";
import { GALLERY, RESULTS, SUBMIT } from "../model/SurveySections";

jest.mock("chart.js");

const clone = rfdc();

describe("component ResultsSection", () => {
  beforeEach(() => {
    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
    surveyStore.dispatch({ type: SET_CURRENT_SECTION, sectionId: RESULTS });
  });

  it("standard render", () => {
    // set some answer values
    const inputState = clone(INPUT_STATE);

    (inputState.answers.pandp.P21 as QuestionAnswer).answer = "a";
    (inputState.answers.pandp.P22 as QuestionAnswer).answer = "b";
    (inputState.answers.pandp.P02 as QuestionAnswer).answer = "c";
    (inputState.answers.pandp.P03 as QuestionAnswer).answer = "d";
    const partnerships = ((3 + 2 + 2 + 3)) * 100 / 12;



    (inputState.answers.pandp.P13 as QuestionAnswer).answer = "a";
    (inputState.answers.pandp.P14 as QuestionAnswer).answer = "b";
    (inputState.answers.pandp.P28 as QuestionAnswer).answer = "c";
    (inputState.answers.pandp.P29 as QuestionAnswer).answer = "d";
    (inputState.answers.pandp.P30 as QuestionAnswer).answer = "a";
    (inputState.answers.nature.SF01 as QuestionAnswer).answer = "a";
    (inputState.answers.nature.SF04 as QuestionAnswer).answer = "a";
    (inputState.answers.pandp.P31 as QuestionAnswer).answer = "a";
    const involvement = ((3 + 2 + 1 + 0 + 3 + 3 + 3 + 0) * 100) / 24;

    const expectedCommunityData = [
      involvement,
      partnerships,
    ];

    // Note... lots of tests were removed here...

    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: inputState });

    renderWithStore(<ResultsSection />);

    expect(largeChartCanvases()).toHaveLength(5);
    expect(smallChartCanvases()).toHaveLength(5);
    expect(Chart).toHaveBeenCalledTimes(16);

    // Check chart data
    const mockChart = Chart as unknown as jest.Mock;
    
    const smallPartnershipChartConfig = mockChart.mock.calls[12][1];
    const largePartnershipChartConfig = mockChart.mock.calls[13][1];

    expect(smallPartnershipChartConfig.data.datasets[0].data).toStrictEqual(
      expectedCommunityData
    );
    expect(largePartnershipChartConfig.data.datasets[0].data).toStrictEqual(
      expectedCommunityData
    );
  });

  it("bottom navigation", async () => {
    const { getByRole, user } = renderWithStore(<ResultsSection />);

    await user.click(getByRole("button", { name: "previous section" }));
    expect(surveyStore.getState().currentSectionId).toBe("air");

    await user.click(getByRole("button", { name: "next section" }));
    expect(surveyStore.getState().currentSectionId).toBe(RESULTS);

    await user.click(getByRole("button", { name: "next section" }));
    expect(surveyStore.getState().currentSectionId).toBe(SUBMIT);
  });

  const smallChartCanvases = () =>
    document.querySelectorAll("canvas.small-chart");
  const largeChartCanvases = () =>
    document.querySelectorAll("canvas.large-chart");
});
