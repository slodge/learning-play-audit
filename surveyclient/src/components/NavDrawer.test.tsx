/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkSelectedSection"] }] */

import React from "react";
import NavDrawer from "./NavDrawer";
import { surveyStore } from "../model/SurveyModel";
import { REFRESH_STATE } from "../model/ActionTypes";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";
import { renderWithStore } from "./ReactTestUtils";
import { INTRODUCTION, RESULTS } from "../model/SurveySections";

const onPopupClose = jest.fn();

describe("component NavDrawer", () => {
  beforeEach(() => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
  });

  it("default render - with answers", () => {
    renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );

    const expectedItemContent = [
      "Introduction",
      "1Background Information5 questions remaining0/5",
      "2Policy and Practice30 questions remaining1/31",
      "3Nature and Sustainability24 questions remaining2/26",
      "4Temperature Management19 questions remaining5/24",
      "5Water Management11 questions remaining4/15",
      "6Carbon Management1 question remaining6/7",
      "7Air Quality3 questions remaining3/6",
      "Results",
      "Submit survey",
    ];

    expect(
      Array.from(fixedMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    expect(
      Array.from(popupMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    checkPopupVisible(true);
  });

  it("default render - no answers", () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: EMPTY_STATE });
    renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );

    const expectedItemContent = [
      "Introduction",
      "1Background Information5 questions remaining0/5",
      "2Policy and Practice31 questions remaining0/31",
      "3Nature and Sustainability26 questions remaining0/26",
      "4Temperature Management24 questions remaining0/24",
      "5Water Management15 questions remaining0/15",
      "6Carbon Management7 questions remaining0/7",
      "7Air Quality6 questions remaining0/6",
      "Results",
      "Submit survey",
    ];

    expect(
      Array.from(fixedMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    expect(
      Array.from(popupMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    checkPopupVisible(true);
  });

  it("default render - closed popup drawer", () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: EMPTY_STATE });
    renderWithStore(
      <NavDrawer popupDrawerOpen={false} onPopupClose={onPopupClose} />
    );

    const expectedItemContent = [
      "Introduction",
      "1Background Information5 questions remaining0/5",
      "2Policy and Practice31 questions remaining0/31",
      "3Nature and Sustainability26 questions remaining0/26",
      "4Temperature Management24 questions remaining0/24",
      "5Water Management15 questions remaining0/15",
      "6Carbon Management7 questions remaining0/7",
      "7Air Quality6 questions remaining0/6",
      "Results",
      "Submit survey",
    ];

    expect(
      Array.from(fixedMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    expect(
      Array.from(popupMenuItems()).map((item) => item.textContent)
    ).toStrictEqual(expectedItemContent);
    checkPopupVisible(false);
  });

  it("select section", async () => {
    const { user } = renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );
    checkSelectedSection(INTRODUCTION);

    await user.click(fixedMenuItem(RESULTS));
    checkSelectedSection(RESULTS);

    await user.click(fixedMenuItem("pandp"));
    checkSelectedSection("pandp");

    await user.click(popupMenuItem(RESULTS));
    checkSelectedSection(RESULTS);

    await user.click(popupMenuItem("pandp"));
    checkSelectedSection("pandp");
  });

  it("close drawer", async () => {
    const { user } = renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );
    expect(onPopupClose).not.toHaveBeenCalled();

    await user.click(closeButton()!);

    expect(onPopupClose).toHaveBeenCalledTimes(1);
  });

  it("close drawer - click outside drawer", async () => {
    const { user } = renderWithStore(
      <NavDrawer popupDrawerOpen={true} onPopupClose={onPopupClose} />
    );
    expect(onPopupClose).not.toHaveBeenCalled();

    const backdrop = document.querySelector(
      ".nav-menu-popup-modal div:first-child"
    )!;
    await user.click(backdrop);

    expect(onPopupClose).toHaveBeenCalledTimes(1);
  });

  const popupNavMenu = () =>
    document.querySelector(".nav-menu-container.popup");
  const fixedMenuItems = () =>
    document.querySelectorAll(".nav-menu-container.fixed .nav-menu-item");
  const popupMenuItems = () =>
    document.querySelectorAll(".nav-menu-container.popup .nav-menu-item");
  const fixedMenuItem = (id: string) =>
    document.querySelector(".nav-menu-container.fixed .nav-menu-item#" + id)!;
  const popupMenuItem = (id: string) =>
    document.querySelector(".nav-menu-container.popup .nav-menu-item#" + id)!;
  const closeButton = () => document.querySelector(".menu-button");

  function checkSelectedSection(expectedSectionId: string | null) {
    checkMenuItems(fixedMenuItems(), expectedSectionId);
    checkMenuItems(popupMenuItems(), expectedSectionId);

    // Check callback called
    expect(surveyStore.getState().currentSectionId).toStrictEqual(
      expectedSectionId
    );
  }

  function checkMenuItems(
    menuItems: NodeListOf<Element>,
    expectedSectionId: string | null
  ) {
    menuItems.forEach((menuItem) => {
      if (menuItem.getAttribute("id") === expectedSectionId) {
        expect(menuItem).toHaveClass("selected");
      } else {
        expect(menuItem).not.toHaveClass("selected");
      }
    });
  }

  function checkPopupVisible(expectPopupVisible: boolean) {
    if (expectPopupVisible) {
      expect(popupNavMenu()).not.toHaveClass("hidden");
    } else {
      expect(popupNavMenu()).toHaveClass("hidden");
    }
  }
});
