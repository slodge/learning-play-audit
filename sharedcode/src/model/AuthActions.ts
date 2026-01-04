import { Auth } from "@aws-amplify/auth";
import { Logger, isEmpty } from "@aws-amplify/core";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./AuthActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  CONFIRM_SIGN_IN,
  CONFIRM_REGISTRATION,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUBMIT,
  RESET_PASSWORD,
  TOTP_SETUP,
  MFA_OPTION_NONE,
  MFA_OPTION_TOTP,
  MFA_OPTION_SMS,
  SOFTWARE_TOKEN_MFA,
  SMS_MFA,
  MfaOption,
  AuthState,
} from "./AuthStates";
import { toDataURL } from "qrcode";
import { AppThunk, FixedCognitoUser, SurveyUser } from "./AuthStore";

const logger = new Logger("auth-utils");

export function setAuthState(authState: AuthState, surveyUser?: SurveyUser) {
  return { type: SET_AUTH_STATE, authState, surveyUser };
}

export function setAuthError(error: Error) {
  return { type: SET_AUTH_ERROR, message: error.message };
}

export function clearAuthError() {
  return { type: CLEAR_AUTH_ERROR };
}

export function checkContact(surveyUser: SurveyUser): AppThunk {
  console.debug("checkContact");
  return function (dispatch) {
    return Auth.verifiedContact(surveyUser.cognitoUser)
      .then((data) => {
        console.log("verifiedContact", data);

        if (!isEmpty(data.verified) || isEmpty(data.unverified)) {
          dispatch(setAuthState(SIGNED_IN, surveyUser));
        } else {
          console.error("Unverified contact: ", surveyUser, data);
          throw new Error("Unverified contact");
        }
      })
      .catch((error) => {
        dispatch(setAuthError(error));
      });
  };
}

export function signIn(email: string, password: string): AppThunk {
  console.debug("signIn");
  return function (dispatch) {
    // We use email address as the username
    return Auth.signIn(email, password)
      .then((cognitoUser: FixedCognitoUser) => {
        logger.debug(cognitoUser);
        const surveyUser = { cognitoUser, email };
        if (cognitoUser.challengeName === "NEW_PASSWORD_REQUIRED") {
          logger.debug("require new password");
          dispatch(setAuthState(RESET_PASSWORD, surveyUser));
        } else if (
          cognitoUser.challengeName === SMS_MFA ||
          cognitoUser.challengeName === SOFTWARE_TOKEN_MFA
        ) {
          logger.debug("confirm user with " + cognitoUser.challengeName);
          dispatch(setAuthState(CONFIRM_SIGN_IN, surveyUser));
        } else if (cognitoUser.challengeName === "MFA_SETUP") {
          logger.debug("TOTP setup");
          dispatch(setAuthState(TOTP_SETUP, surveyUser));
        } else {
          return dispatch(checkContact(surveyUser));
        }
      })
      .catch((error) => {
        dispatch(setAuthError(error));
        if (error.code === "UserNotConfirmedException") {
          logger.debug("the user is not confirmed");
          dispatch(setAuthState(CONFIRM_REGISTRATION, { email }));
        } else if (error.code === "PasswordResetRequiredException") {
          logger.debug("the user requires a new password");
          dispatch(setAuthState(FORGOT_PASSWORD_REQUEST, { email }));
        }
      });
  };
}

export function resendConfirmCode(surveyUser: SurveyUser): AppThunk {
  console.debug("resendConfirmCode");
  return function (dispatch) {
    return Auth.resendSignUp(surveyUser.email)
      .then(() => {
        dispatch(setAuthState(CONFIRM_REGISTRATION, surveyUser));
      })
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function confirmRegistration(
  surveyUser: SurveyUser,
  code: string
): AppThunk {
  console.debug("confirmRegistration");
  return function (dispatch) {
    return Auth.confirmSignUp(surveyUser.email, code)
      .then((result) => {
        if (!result) {
          throw new Error("Confirm Sign Up Failed");
        }
        if (surveyUser.password) {
          // Auto sign in user if password is available from previous workflow
          return dispatch(signIn(surveyUser.email, surveyUser.password));
        } else {
          dispatch(setAuthState(SIGN_IN, surveyUser));
        }
      })
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function confirmSignIn(
  surveyUser: SurveyUser,
  code: string,
  mfaOption: MfaOption
): AppThunk {
  console.debug("confirmSignIn");
  return function (dispatch) {
    return Auth.confirmSignIn(
      surveyUser.cognitoUser,
      code,
      mfaOption === MFA_OPTION_TOTP ? SOFTWARE_TOKEN_MFA : null
    )
      .then(() => dispatch(checkContact(surveyUser)))
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function register(email: string, password: string): AppThunk {
  console.debug("register");
  return function (dispatch) {
    // We use email address as the username
    return Auth.signUp({ username: email, password })
      .then((result) => {
        if (!result) {
          throw new Error("Sign Up Failed");
        }
        if (result.userConfirmed) {
          // Auto sign in user if pre-confirmed
          return dispatch(signIn(email, password));
        } else {
          dispatch(
            setAuthState(CONFIRM_REGISTRATION, {
              cognitoUser: result.user,
              email,
              password,
            })
          );
        }
      })
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function completeNewPassword(
  surveyUser: SurveyUser,
  newPassword: string
): AppThunk {
  console.debug("completeNewPassword");
  return function (dispatch) {
    let getUserPromise = null;
    if (!surveyUser.cognitoUser) {
      getUserPromise = () => Auth.currentAuthenticatedUser();
    } else {
      getUserPromise = () => Promise.resolve(surveyUser.cognitoUser);
    }
    return getUserPromise()
      .then((cognitoUser) =>
        Auth.completeNewPassword(cognitoUser, newPassword, {})
      )
      .then((cognitoUser) =>
        dispatch(checkContact({ ...surveyUser, cognitoUser }))
      )
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function signOut(): AppThunk {
  console.debug("signOut");
  return function (dispatch) {
    return Auth.signOut()
      .then(() => dispatch(setAuthState(SIGN_IN)))
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function forgotPasswordRequest(email: string): AppThunk {
  console.debug("forgotPasswordRequest");
  return function (dispatch) {
    return Auth.forgotPassword(email)
      .then(() => dispatch(setAuthState(FORGOT_PASSWORD_SUBMIT, { email })))
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function forgotPasswordSubmit(
  email: string,
  code: string,
  newPassword: string
): AppThunk {
  console.debug("forgotPasswordSubmit");
  return function (dispatch) {
    // We use email address as the username
    return Auth.forgotPasswordSubmit(email, code, newPassword)
      .then(() => dispatch(setAuthState(SIGN_IN)))
      .catch((error) => dispatch(setAuthError(error)));
  };
}

export function signInCurrentUser(): AppThunk {
  console.debug("signInCurrentUser");
  return function (dispatch) {
    return Auth.currentAuthenticatedUser()
      .then((cognitoUser) =>
        dispatch(
          setAuthState(SIGNED_IN, {
            cognitoUser,
            // Warning: Stuart changed this as cognitoUser.username is NOT always email!
            // ... but is it safe to assume email is always present in attributes?
            // I don't know!
            email: cognitoUser.attributes.email,
          })
        )
      )
      .catch(() => {
        logger.info("User not logged in");
        return Promise.resolve("User not logged in");
      });
  };
}

export function getTOTPSetupQrCode(surveyUser: SurveyUser) {
  console.debug("getTOTPSetupQrCode");
  return Auth.setupTOTP(surveyUser.cognitoUser).then((secretKey) =>
    Promise.resolve(
      toDataURL(
        `otpauth://totp/AWSCognito:${surveyUser.email}?secret=${secretKey}&issuer=AWSCognito`
      )
    )
  );
}

export function verifyTOTPSetup(
  surveyUser: SurveyUser,
  code: string
): AppThunk {
  console.debug("verifyTOTPSetup");
  return function (dispatch) {
    return Auth.verifyTotpToken(surveyUser.cognitoUser, code)
      .then(() => dispatch(checkContact(surveyUser)))
      .catch((error) => {
        console.error(error);
        dispatch(setAuthError(error));
      });
  };
}

export function getUserMFA(surveyUser: SurveyUser): Promise<MfaOption> {
  console.debug("getUserMFA");
  return Auth.getPreferredMFA(surveyUser.cognitoUser).then((data) => {
    console.debug("Preferred MFA", data);
    if (data === SOFTWARE_TOKEN_MFA) {
      return MFA_OPTION_TOTP;
    }
    if (data === SMS_MFA) {
      return MFA_OPTION_SMS;
    }
    return MFA_OPTION_NONE;
  });
}
