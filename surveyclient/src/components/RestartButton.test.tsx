import React from "react";
import RestartButton from "./RestartButton";
import { surveyStore, SurveyStoreState } from "../model/SurveyModel";
import { REFRESH_STATE } from "../model/ActionTypes";
import { EMPTY_STATE, INPUT_STATE } from "../model/TestUtils";
import { renderWithStore } from "./ReactTestUtils";
import { RESULTS, INTRODUCTION } from "../model/SurveySections";
import { SIGNED_IN } from "learning-play-audit-shared";

describe("component RestartButton", () => {
  const TEST_STATE: SurveyStoreState = {
    ...INPUT_STATE,
    currentSectionId: RESULTS,
  };

  beforeEach(() => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: TEST_STATE });
  });

  it("confirm dialog appears", async () => {
    const { getByRole, user } = renderWithStore(<RestartButton />);
    expect(confirmYesButton()).toBeNull();

    await user.click(getByRole("button", { name: "restart survey" }));
    expect(confirmYesButton()).not.toBeNull();
  });

  it("restart cancel", async () => {
    const { getByRole, user } = renderWithStore(<RestartButton />);
    await user.click(getByRole("button", { name: "restart survey" }));

    await user.click(confirmNoButton());

    expect(confirmYesButton()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual(TEST_STATE);
  });

  it("restart cancel click background", async () => {
    const { getByRole, user } = renderWithStore(<RestartButton />);
    await user.click(getByRole("button", { name: "restart survey" }));

    const backdrop = document.querySelector(
      "#dialog-container div:first-child"
    )!;
    await user.click(backdrop);

    expect(confirmYesButton()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual(TEST_STATE);
  });

  it("restart confirm", async () => {
    const { getByRole, user } = renderWithStore(<RestartButton />);
    await user.click(getByRole("button", { name: "restart survey" }));

    await user.click(confirmYesButton());

    expect(confirmYesButton()).toBeNull();
    expect(surveyStore.getState()).toStrictEqual({
      ...EMPTY_STATE,
      initialisingState: false,
      currentSectionId: INTRODUCTION,
      authState: SIGNED_IN,
      hasEverLoggedIn: true,
      hasSeenSplashPage: true,
      surveyUser: { email: "test@example.com" },
    });
  });

  const confirmYesButton = () => document.querySelector(".dialog #yes-button")!;
  const confirmNoButton = () => document.querySelector(".dialog #no-button")!;
});
