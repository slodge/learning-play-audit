/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedSection"] }] */

import React from "react";
import App from "./App";
import { surveyStore } from "./model/SurveyModel";
import { REFRESH_STATE } from "./model/ActionTypes";
import { SIGNED_IN, REGISTER } from "learning-play-audit-shared";
import { INPUT_STATE } from "./model/TestUtils";
import { INTRODUCTION, RESULTS, GALLERY, SUBMIT } from "./model/SurveySections";
import { renderWithStore } from "./components/ReactTestUtils";

jest.mock("@aws-amplify/core");
jest.spyOn(window, "scrollTo").mockImplementation(() => {
  // Do nothing
});

describe("main App", () => {
  beforeEach(() => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
  });

  it("initial render - normal content", () => {
    // Default test data is signed in - just making sure
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...INPUT_STATE,
        authState: SIGNED_IN,
        hasSeenSplashPage: true,
      },
    });
    renderWithStore(<App />);

    expect(getStartedSection()).toBeNull();
    expect(authenticatorSection()).toBeNull();
    expect(mainContent()).not.toBeNull();
  });

  it("initial render - splash page", () => {
    // Default test data is signed in - just making sure
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...INPUT_STATE,
        authState: SIGNED_IN,
        hasSeenSplashPage: false,
      },
    });
    renderWithStore(<App />);

    expect(getStartedSection()).not.toBeNull();
    expect(authenticatorSection()).toBeNull();
    expect(mainContent()).toBeNull();
  });

  it("initial render - authentication", () => {
    // Default test data is signed in - just making sure
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...INPUT_STATE,
        authState: REGISTER,
        hasSeenSplashPage: false,
      },
    });
    renderWithStore(<App />);

    expect(getStartedSection()).toBeNull();
    expect(authenticatorSection()).not.toBeNull();
    expect(mainContent()).toBeNull();
  });

  it("initial render - navbar section choice", async () => {
    // Default test data is signed in - just making sure
    surveyStore.dispatch({
      type: REFRESH_STATE,
      state: {
        ...INPUT_STATE,
        authState: SIGNED_IN,
        hasSeenSplashPage: true,
      },
    });
    
    const { user } = renderWithStore(<App />);
    checkSelectedSection(INTRODUCTION);

    await user.click(fixedMenuItem(RESULTS));
    checkSelectedSection(RESULTS);

    //await user.click(fixedMenuItem(GALLERY));
    //checkSelectedSection(GALLERY);

    await user.click(fixedMenuItem(SUBMIT));
    checkSelectedSection(SUBMIT);

    await user.click(fixedMenuItem("nature"));
    checkSelectedSection("nature");
  });

  function checkSelectedSection(expectedSectionId: string) {
    renderWithStore(<App />);

    checkMenuItems(fixedMenuItems(), expectedSectionId);
    checkMenuItems(popupMenuItems(), expectedSectionId);

    expect(section(expectedSectionId)).not.toBeNull();
  }

  function checkMenuItems(
    menuItems: NodeListOf<Element>,
    expectedSectionId: string
  ) {
    menuItems.forEach((menuItem) => {
      if (menuItem.getAttribute("id") === expectedSectionId) {
        expect(menuItem).toHaveClass("selected");
      } else {
        console.debug("Checking menu item " + menuItem.getAttribute("id") + " expected " + expectedSectionId);
        expect(menuItem).not.toHaveClass("selected");
        console.debug("Checked menu item " + menuItem.getAttribute("id"));
      }
    });
  }

  const getStartedSection = () =>
    document.querySelector(".section.get-started");
  const authenticatorSection = () =>
    document.querySelector(".section.authenticator");
  const section = (sectionName: string) =>
    document.querySelector(".section." + sectionName);
  const mainContent = () => document.querySelector(".content.main");
  const fixedMenuItem = (id: string) =>
    document.querySelector(".nav-menu-container.fixed .nav-menu-item#" + id)!;
  const fixedMenuItems = () =>
    document.querySelectorAll(".nav-menu-container.fixed .nav-menu-item");
  const popupMenuItems = () =>
    document.querySelectorAll(".nav-menu-container.popup .nav-menu-item");
});
