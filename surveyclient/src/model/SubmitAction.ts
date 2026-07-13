import { v4 as uuidv4 } from "uuid";
import { Auth } from "@aws-amplify/auth";
import axios, { AxiosPromise, AxiosRequestHeaders } from "axios";
import {
  SUBMITTING_START,
  SUBMIT_COMPLETE,
  SUBMIT_FAILED,
} from "./SubmitStates";

import {
  SurveyAnswers,
  SurveyStoreState,
} from "./SurveyModel";

interface SubmitSurveyBody {
  uuid: string;
  survey: SurveyAnswers;
}

function submitSurveyAxios(
  endpoint: string,
  headers: AxiosRequestHeaders,
  body: SubmitSurveyBody
): AxiosPromise {
  console.debug("POST survey");
  return axios
    .post("/survey", JSON.stringify(body), {
      baseURL: endpoint,
      headers
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

export function submitSurvey(
  setSubmitState: (state: string) => void,
  setProgressValue: (value: number) => void,
  state: SurveyStoreState,
  endpoint: string
) {
  console.debug(
    "Results:",
    JSON.stringify(state.answers),
  );

  let progress = 0;
  const maxProgressCount = 1;

  const incrementProgress = () => {
    progress++;
    setProgressValue(Math.round((progress * 100) / maxProgressCount));
  };

  const { email } = state.surveyUser!;

  const uuid = uuidv4();

  const headers: AxiosRequestHeaders = {
    "Content-Type": "application/json; charset=UTF-8",
  };
  setProgressValue(0);
  setSubmitState(SUBMITTING_START);
  return Auth.currentSession()
    .then((session) => {
      headers.Authorization = `Bearer ${session.getIdToken().getJwtToken()}`;

      if (!email) {
        throw new Error("User email missing");
      }
      const submitRequest = {
        uuid,
        survey: state.answers,
        surveyVersion: state.surveyVersion,
      };
      submitRequest.survey.background.email = {
        answer: email,
        comments: "",
      };

      return submitSurveyAxios(endpoint, headers, submitRequest);
    })
    .then((response) => {
      console.debug("submitSurvey complete", response);
      if (response.status !== 200) {
        throw new Error(JSON.stringify(response));
      }
      incrementProgress();
      setSubmitState(SUBMIT_COMPLETE);
    })
    .catch((err) => {
      console.error(err);
      setSubmitState(SUBMIT_FAILED);
    });
}
