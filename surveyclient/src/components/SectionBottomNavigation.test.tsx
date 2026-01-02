import { BACKGROUND } from "learning-play-audit-survey";
import React from "react";
import { SET_CURRENT_SECTION } from "../model/ActionTypes";
import { surveyStore } from "../model/SurveyModel";
import { GALLERY, INTRODUCTION, RESULTS, SUBMIT } from "../model/SurveySections";
import { renderWithStore } from "./ReactTestUtils";
import SectionBottomNavigation from "./SectionBottomNavigation";

describe("component SectionBottomNavigation", () => {
  it("first section", async () => {
    surveyStore.dispatch({
      type: SET_CURRENT_SECTION,
      sectionId: INTRODUCTION,
    });
    const { getByRole, user } = renderWithStore(<SectionBottomNavigation />);

    const previousButton = getByRole("button", { name: "previous section" });
    const nextButton = getByRole("button", { name: "next section" });
    expect(previousButton).toBeDisabled();
    expect(previousButton).toHaveClass("hidden");
    expect(nextButton).not.toBeDisabled();
    expect(nextButton).not.toHaveClass("hidden");

    await user.click(nextButton);
    expect(surveyStore.getState().currentSectionId).toBe(BACKGROUND);
  });

  it("middle section", async () => {
    surveyStore.dispatch({ type: SET_CURRENT_SECTION, sectionId: "nature" });
    const { getByRole, user } = renderWithStore(<SectionBottomNavigation />);

    const previousButton = getByRole("button", { name: "previous section" });
    const nextButton = getByRole("button", { name: "next section" });
    expect(previousButton).not.toBeDisabled();
    expect(previousButton).not.toHaveClass("hidden");
    expect(nextButton).not.toBeDisabled();
    expect(nextButton).not.toHaveClass("hidden");

    await user.click(nextButton);
    expect(surveyStore.getState().currentSectionId).toBe("temperature");
    await user.click(previousButton);
    expect(surveyStore.getState().currentSectionId).toBe("nature");
  });

  it("last section", async () => {
    surveyStore.dispatch({ type: SET_CURRENT_SECTION, sectionId: SUBMIT });
    const { getByRole, user } = renderWithStore(<SectionBottomNavigation />);

    const previousButton = getByRole("button", { name: "previous section" });
    const nextButton = getByRole("button", { name: "next section" });
    expect(previousButton).not.toBeDisabled();
    expect(previousButton).not.toHaveClass("hidden");
    expect(nextButton).toBeDisabled();
    expect(nextButton).toHaveClass("hidden");

    await user.click(previousButton);
    expect(surveyStore.getState().currentSectionId).toBe(RESULTS);
  });
});
