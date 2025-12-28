import React, { useEffect, useState } from "react";
import {
  Section,
  sectionQuestions,
  sectionsContent,
} from "learning-play-audit-survey";
import SectionSummary from "./SectionSummary";
import Modal from "@material-ui/core/Modal";
import { menuButtonSvg } from "./SvgUtils";
import {
  GALLERY,
  INTRODUCTION,
  RESULTS,
  SUBMIT,
} from "../model/SurveySections";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentSectionId } from "../model/SurveyModel";
import { SET_CURRENT_SECTION } from "../model/ActionTypes";

export interface NavDrawerProps {
  popupDrawerOpen: boolean;
  onPopupClose: () => void;
}

export default function NavDrawer({
  popupDrawerOpen,
  onPopupClose,
}: NavDrawerProps) {
  const dispatch = useDispatch();
  const currentSectionId = useSelector(getCurrentSectionId);

  const [totalQuestionsMap, setTotalQuestionsMap] = useState<Map<
    string,
    number
  > | null>(null);

  useEffect(() => {
    var result = new Map();
    sectionsContent.forEach((section) => {
      result.set(section.id, sectionQuestions(section).length);
    });
    setTotalQuestionsMap(result);
  }, []);

  const drawer = (
    <div className="nav-menu">
      {createMenuItem("Introduction", INTRODUCTION)}
      {sectionsContent.map(createSectionMenuItem)}
      {createMenuItem("Results", RESULTS)}
      {/*createMenuItem("Photos", GALLERY)*/}
      {createMenuItem("Submit survey", SUBMIT)}
    </div>
  );

  function createMenuItem(title: string, id: string) {
    return (
      <div
        key={id}
        id={id}
        className={
          "nav-menu-item" + (currentSectionId === id ? " selected" : "")
        }
        onClick={() => dispatch({ type: SET_CURRENT_SECTION, sectionId: id })}
      >
        <span className="section-title">{title}</span>
      </div>
    );
  }

  function createSectionMenuItem(section: Section) {
    return (
      <SectionSummary
        key={section.id}
        section={section}
        totalQuestions={
          totalQuestionsMap === null ? 0 : totalQuestionsMap.get(section.id)!
        }
        onClick={() =>
          dispatch({ type: SET_CURRENT_SECTION, sectionId: section.id })
        }
      />
    );
  }

  return (
    <>
      <Modal
        className="nav-menu-popup-modal"
        open={popupDrawerOpen}
        onClose={onPopupClose}
        container={
          window !== undefined ? () => window.document.body : undefined
        }
        keepMounted={true}
      >
        <nav
          className={
            "nav-menu-container popup" + (popupDrawerOpen ? "" : " hidden")
          }
          aria-label="survey sections"
        >
          <button
            aria-label="close drawer"
            onClick={onPopupClose}
            className="menu-button"
          >
            {menuButtonSvg()}
          </button>
          {drawer}
        </nav>
      </Modal>
      <nav className="nav-menu-container fixed" aria-label="survey sections">
        {drawer}
      </nav>
    </>
  );
}
