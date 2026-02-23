import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONFIRM_WELCOME } from "../model/ActionTypes";
import { getHasEverLoggedIn } from "../model/SurveyModel";

export interface GetStartedScreenProps {
  downloadButton: React.ReactNode;
}

export default function GetStartedScreen({
  downloadButton,
}: GetStartedScreenProps) {
  const dispatch = useDispatch();
  const hasEverLoggedIn = useSelector(getHasEverLoggedIn);

  function buttonText() {
    return hasEverLoggedIn ? "CONTINUE SURVEY" : "START SURVEY HERE";
  }

  return (
    <div className="section get-started">
      <img className="title-logo-small" src="./assets/ltl-logo.jpg" alt="" />
      <h2>Get Started!</h2>

      <p>
        The Learning through Landscapes School Grounds Audit can be
        filled in offline outdoors. We strongly suggest that you undertake the
        survey while walking around your outdoor space. You can add notes, offer
        opinion and upload photographs as you go.
      </p>
      <p>
        However you will need to have access to a reliable internet connection
        to be able to submit your completed answers at the end of the survey.
      </p>
      {downloadButton && (
        <p>
          You can either fill in the survey here in your browser, or download it
          as an app using the Install button.
        </p>
      )}
      <p>
        At the end of the survey you will have access to the results, notes and
        images you added. You will be emailed a copy too.
      </p>
      <div className="action-row">
        <button
          className="confirm-button"
          onClick={() => dispatch({ type: CONFIRM_WELCOME })}
        >
          <span>{buttonText()}</span>
        </button>
        {downloadButton}
      </div>
    </div>
  );
}
