import { CognitoUser } from "@aws-amplify/auth";
import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./AuthActionTypes";
import { AuthState, REGISTER, SignInChallengeName } from "./AuthStates";

// The Amplify signin response type is incorrect - fixing here
export type FixedCognitoUser = CognitoUser & {
  challengeName?: SignInChallengeName;
};

export interface SurveyUser {
  // Stuart says: this comment is wrong!!!!
  // WRONG: cognitoUser.username is the same as email - we keep both as no cognito user prior to login
  cognitoUser?: FixedCognitoUser;
  email: string;
  // Only held between registration and first sign in
  password?: string;
}

export interface AuthStoreState {
  authState: AuthState;
  errorMessage: string;
  surveyUser?: SurveyUser;
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AuthStoreState,
  unknown,
  AnyAction
>;

function initialState(): AuthStoreState {
  console.debug("Setting initialState");
  return {
    authState: REGISTER,
    errorMessage: "",
  };
}

export function authReducer(state = initialState(), action = {} as AnyAction) {
  switch (action.type) {
    case SET_AUTH_STATE:
      console.debug("SET_AUTH_STATE");
      return setAuthState(state, action);

    case SET_AUTH_ERROR:
      console.debug("SET_AUTH_ERROR");
      return setAuthError(state, action);

    case CLEAR_AUTH_ERROR:
      console.debug("CLEAR_AUTH_ERROR");
      return clearAuthError(state);

    default:
      return state;
  }
}

function setAuthState(
  state: AuthStoreState,
  { authState, surveyUser }: AnyAction
): AuthStoreState {
  if (authState === undefined) {
    console.error("authState cannot be undefined");
    return state;
  }
  return {
    ...state,
    authState,
    surveyUser,
    errorMessage: "",
  };
}

function setAuthError(
  state: AuthStoreState,
  { message }: AnyAction
): AuthStoreState {
  return state.errorMessage === message
    ? state
    : { ...state, errorMessage: message };
}

function clearAuthError(state: AuthStoreState): AuthStoreState {
  return state.errorMessage === "" ? state : { ...state, errorMessage: "" };
}

export function getAuthState(state: AuthStoreState) {
  return state.authState;
}
export function getAuthError(state: AuthStoreState) {
  return state.errorMessage;
}
export function getSurveyUser(state: AuthStoreState) {
  return state.surveyUser;
}
