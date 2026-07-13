import {
  setAuthState,
  setAuthError,
  clearAuthError,
  checkContact,
  signIn,
  confirmSignIn,
  resendConfirmCode,
  confirmRegistration,
  register,
  completeNewPassword,
  signOut,
  forgotPasswordRequest,
  forgotPasswordSubmit,
  signInCurrentUser,
  getTOTPSetupQrCode,
  verifyTOTPSetup,
  getUserMFA,
} from "./AuthActions";
import { AuthStoreState, SurveyUser } from "./AuthStore";
import {
  SET_AUTH_STATE,
  SET_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
} from "./AuthActionTypes";
import {
  SIGNED_IN,
  SIGN_IN,
  CONFIRM_SIGN_IN,
  REGISTER,
  RESET_PASSWORD,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUBMIT,
  CONFIRM_REGISTRATION,
  NEW_PASSWORD_REQUIRED,
  TOTP_SETUP,
  MFA_OPTION_NONE,
  MFA_OPTION_TOTP,
  MFA_OPTION_SMS,
  SMS_MFA,
  NO_MFA,
  SOFTWARE_TOKEN_MFA,
} from "./AuthStates";
import { Auth, CognitoUser } from "@aws-amplify/auth";
import * as QRCode from "qrcode";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { authStore } from "../setupTests";

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "test password";

const TEST_COGNITO_USER = {
  getUsername: () => TEST_EMAIL,
  attributes: {
    email: TEST_EMAIL
  }
} as unknown as CognitoUser;

const TEST_USER: SurveyUser = {
  email: TEST_EMAIL,
};
const TEST_USER_WITH_PASSWORD: SurveyUser = {
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
};
const TEST_USER_WITH_COGNITO: SurveyUser = {
  email: TEST_EMAIL,
  cognitoUser: TEST_COGNITO_USER,
};
const TEST_SIGNUP_ATTRS = { username: TEST_EMAIL, password: TEST_PASSWORD };

const authDispatch: ThunkDispatch<AuthStoreState, any, AnyAction> =
  authStore.dispatch;

jest.mock("@aws-amplify/auth");
jest.mock("qrcode");

const mockVerifiedContact = Auth.verifiedContact as jest.Mock;
const mockSignIn = Auth.signIn as jest.Mock;
const mockSignUp = Auth.signUp as jest.Mock;
const mockSignOut = Auth.signOut as jest.Mock;
const mockConfirmSignIn = Auth.confirmSignIn as jest.Mock;
const mockConfirmSignUp = Auth.confirmSignUp as jest.Mock;
const mockResendSignUp = Auth.resendSignUp as jest.Mock;
const mockCompleteNewPassword = Auth.completeNewPassword as jest.Mock;
const mockCurrentAuthenticatedUser = Auth.currentAuthenticatedUser as jest.Mock;
const mockForgotPassword = Auth.forgotPassword as jest.Mock;
const mockForgotPasswordSubmit = Auth.forgotPasswordSubmit as jest.Mock;
const mockSetupTOTP = Auth.setupTOTP as jest.Mock;
const mockGetPreferredMFA = Auth.getPreferredMFA as jest.Mock;
const mockSetPreferredMFA = Auth.setPreferredMFA as jest.Mock;
const mockVerifyTotpToken = Auth.verifyTotpToken as jest.Mock;

const mockQRCodeToDataURL = QRCode.toDataURL as jest.Mock;

describe("simple methods", () => {
  it("setAuthState", () => {
    expect(setAuthState(CONFIRM_REGISTRATION, TEST_USER)).toStrictEqual({
      type: SET_AUTH_STATE,
      authState: CONFIRM_REGISTRATION,
      surveyUser: TEST_USER,
    });
  });

  it("setAuthError", () => {
    expect(setAuthError(new Error("test message"))).toStrictEqual({
      type: SET_AUTH_ERROR,
      message: "test message",
    });
  });

  it("clearAuthError", () => {
    expect(clearAuthError()).toStrictEqual({ type: CLEAR_AUTH_ERROR });
  });
});

describe("checkContact", () => {
  beforeEach(() => {
    authDispatch(setAuthState(REGISTER));
  });

  it("verified + unverified = verified contact", async () => {
    mockVerifiedContact.mockImplementation(() =>
      Promise.resolve({
        verified: { email: TEST_EMAIL },
        unverified: { email: TEST_EMAIL },
      })
    );

    await authDispatch(checkContact(TEST_USER_WITH_COGNITO));
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("!verified + !unverified = verified contact", async () => {
    mockVerifiedContact.mockImplementation(() => Promise.resolve({}));

    await authDispatch(checkContact(TEST_USER_WITH_COGNITO));
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("unverified contact", async () => {
    mockVerifiedContact.mockImplementation(() =>
      Promise.resolve({ unverified: { email: TEST_EMAIL } })
    );

    await authDispatch(checkContact(TEST_USER_WITH_COGNITO));
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "Unverified contact",
      authState: REGISTER,
      surveyUser: undefined,
    });
  });

  it("error calling verifiedContact", async () => {
    mockVerifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(checkContact(TEST_USER_WITH_COGNITO));
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: REGISTER,
      surveyUser: undefined,
    });
  });
});

describe("signIn", () => {
  beforeEach(() => {
    authDispatch(setAuthState(REGISTER));

    mockVerifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("signIn success", async () => {
    mockSignIn.mockImplementation(() => Promise.resolve(TEST_COGNITO_USER));

    await authDispatch(signIn(TEST_EMAIL, "password"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, "password");
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("new password needed", async () => {
    const cognitoUser = {
      getUsername: () => TEST_EMAIL,
      challengeName: "NEW_PASSWORD_REQUIRED",
    } as unknown as CognitoUser;

    mockSignIn.mockImplementation(() => Promise.resolve(cognitoUser));

    await authDispatch(signIn(TEST_EMAIL, "password"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, "password");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: RESET_PASSWORD,
      surveyUser: { email: TEST_EMAIL, cognitoUser },
    });
  });

  it("confirm signin SMS", async () => {
    const cognitoUser = {
      getUsername: () => TEST_EMAIL,
      challengeName: SMS_MFA,
    } as unknown as CognitoUser;

    mockSignIn.mockImplementation(() => Promise.resolve(cognitoUser));

    await authDispatch(signIn(TEST_EMAIL, "password"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, "password");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: CONFIRM_SIGN_IN,
      surveyUser: { email: TEST_EMAIL, cognitoUser },
    });
  });

  it("confirm signin TOTP", async () => {
    const cognitoUser = {
      getUsername: () => TEST_EMAIL,
      challengeName: SOFTWARE_TOKEN_MFA,
    } as unknown as CognitoUser;

    mockSignIn.mockImplementation(() => Promise.resolve(cognitoUser));

    await authDispatch(signIn(TEST_EMAIL, "password"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, "password");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: CONFIRM_SIGN_IN,
      surveyUser: { email: TEST_EMAIL, cognitoUser },
    });
  });

  it("mfa TOTP setup", async () => {
    const cognitoUser = {
      getUsername: () => TEST_EMAIL,
      challengeName: "MFA_SETUP",
    } as unknown as CognitoUser;

    mockSignIn.mockImplementation(() => Promise.resolve(cognitoUser));

    await authDispatch(signIn(TEST_EMAIL, "password"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, "password");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: TOTP_SETUP,
      surveyUser: { email: TEST_EMAIL, cognitoUser },
    });
  });

  it("confirm registration", async () => {
    mockSignIn.mockImplementation(() =>
      Promise.reject({
        code: "UserNotConfirmedException",
        message: "error message",
      })
    );

    await authDispatch(signIn(TEST_EMAIL, "password"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, "password");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: CONFIRM_REGISTRATION,
      surveyUser: { email: TEST_EMAIL },
    });
  });

  it("forgot password", async () => {
    mockSignIn.mockImplementation(() =>
      Promise.reject({
        code: "PasswordResetRequiredException",
        message: "error message",
      })
    );

    await authDispatch(signIn(TEST_EMAIL, "password"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, "password");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: FORGOT_PASSWORD_REQUEST,
      surveyUser: { email: TEST_EMAIL },
    });
  });

  it("error calling signIn", async () => {
    mockSignIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(signIn(TEST_EMAIL, "password"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, "password");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: REGISTER,
      surveyUser: undefined,
    });
  });

  it("error calling verifiedContact", async () => {
    mockSignIn.mockImplementation(() => Promise.resolve(TEST_USER));
    mockVerifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(signIn(TEST_EMAIL, "password"));
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, "password");
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: REGISTER,
      surveyUser: undefined,
    });
  });
});

describe("confirmSignIn", () => {
  beforeEach(() => {
    authDispatch(setAuthState(CONFIRM_SIGN_IN, TEST_USER_WITH_COGNITO));

    mockVerifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("confirm SMS success", async () => {
    mockConfirmSignIn.mockImplementation(() => Promise.resolve(true));

    await authDispatch(
      confirmSignIn(TEST_USER_WITH_COGNITO, "passcode", MFA_OPTION_SMS)
    );
    expect(mockConfirmSignIn).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignIn).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "passcode",
      null
    );
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("confirm TOTP success", async () => {
    mockConfirmSignIn.mockImplementation(() => Promise.resolve(true));

    await authDispatch(
      confirmSignIn(TEST_USER_WITH_COGNITO, "passcode", MFA_OPTION_TOTP)
    );
    expect(mockConfirmSignIn).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignIn).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "passcode",
      SOFTWARE_TOKEN_MFA
    );
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("error calling verifiedContact", async () => {
    mockConfirmSignIn.mockImplementation(() => Promise.resolve(true));
    mockVerifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(
      confirmSignIn(TEST_USER_WITH_COGNITO, "passcode", MFA_OPTION_SMS)
    );
    expect(mockConfirmSignIn).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignIn).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "passcode",
      null
    );
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: CONFIRM_SIGN_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("error calling confirmSignIn", async () => {
    mockConfirmSignIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(
      confirmSignIn(TEST_USER_WITH_COGNITO, "passcode", MFA_OPTION_SMS)
    );
    expect(mockConfirmSignIn).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignIn).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "passcode",
      null
    );
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: CONFIRM_SIGN_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });
});

describe("resendConfirmCode", () => {
  beforeEach(() => {
    authDispatch(setAuthState(REGISTER, TEST_USER));
  });

  it("success", async () => {
    mockResendSignUp.mockImplementation(() => Promise.resolve());

    await authDispatch(resendConfirmCode(TEST_USER));
    expect(mockResendSignUp).toHaveBeenCalledTimes(1);
    expect(mockResendSignUp).toHaveBeenCalledWith(TEST_EMAIL);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: CONFIRM_REGISTRATION,
      surveyUser: TEST_USER,
    });
  });

  it("error calling resendSignUp", async () => {
    mockResendSignUp.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(resendConfirmCode(TEST_USER));
    expect(mockResendSignUp).toHaveBeenCalledTimes(1);
    expect(mockResendSignUp).toHaveBeenCalledWith(TEST_EMAIL);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: REGISTER,
      surveyUser: TEST_USER,
    });
  });
});

describe("confirmRegistration", () => {
  beforeEach(() => {
    authDispatch(setAuthState(CONFIRM_REGISTRATION));

    mockVerifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("confirm and request signIn", async () => {
    mockConfirmSignUp.mockImplementation(() => Promise.resolve(true));

    await authDispatch(confirmRegistration(TEST_USER, "passcode"));
    expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignUp).toHaveBeenCalledWith(TEST_EMAIL, "passcode");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGN_IN,
      surveyUser: TEST_USER,
    });
  });

  it("confirm and signIn success", async () => {
    mockConfirmSignUp.mockImplementation(() => Promise.resolve(true));
    mockSignIn.mockImplementation(() => Promise.resolve(TEST_COGNITO_USER));

    await authDispatch(
      confirmRegistration(TEST_USER_WITH_PASSWORD, "passcode")
    );
    expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignUp).toHaveBeenCalledWith(TEST_EMAIL, "passcode");
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("confirm and new password needed", async () => {
    const cognitoUser = {
      ...TEST_USER,
      challengeName: "NEW_PASSWORD_REQUIRED",
    };
    mockConfirmSignUp.mockImplementation(() => Promise.resolve(true));
    mockSignIn.mockImplementation(() => Promise.resolve(cognitoUser));

    await authDispatch(
      confirmRegistration(TEST_USER_WITH_PASSWORD, "passcode")
    );
    expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignUp).toHaveBeenCalledWith(TEST_EMAIL, "passcode");
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: RESET_PASSWORD,
      surveyUser: { cognitoUser, email: TEST_EMAIL },
    });
  });

  it("confirm and confirm registration - shouldn't really happen", async () => {
    mockConfirmSignUp.mockImplementation(() => Promise.resolve(true));
    mockSignIn.mockImplementation(() =>
      Promise.reject({
        code: "UserNotConfirmedException",
        message: "error message",
      })
    );

    await authDispatch(
      confirmRegistration(TEST_USER_WITH_PASSWORD, "passcode")
    );
    expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignUp).toHaveBeenCalledWith(TEST_EMAIL, "passcode");
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: CONFIRM_REGISTRATION,
      surveyUser: { email: TEST_EMAIL },
    });
  });

  it("confirm and forgot password", async () => {
    mockConfirmSignUp.mockImplementation(() => Promise.resolve(true));
    mockSignIn.mockImplementation(() =>
      Promise.reject({
        code: "PasswordResetRequiredException",
        message: "error message",
      })
    );

    await authDispatch(
      confirmRegistration(TEST_USER_WITH_PASSWORD, "passcode")
    );
    expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignUp).toHaveBeenCalledWith(TEST_EMAIL, "passcode");
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: FORGOT_PASSWORD_REQUEST,
      surveyUser: { email: TEST_EMAIL },
    });
  });

  it("confirm and error calling signIn", async () => {
    mockConfirmSignUp.mockImplementation(() => Promise.resolve(true));
    mockSignIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(
      confirmRegistration(TEST_USER_WITH_PASSWORD, "passcode")
    );
    expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignUp).toHaveBeenCalledWith(TEST_EMAIL, "passcode");
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: CONFIRM_REGISTRATION,
      surveyUser: undefined,
    });
  });

  it("error calling verifiedContact", async () => {
    mockConfirmSignUp.mockImplementation(() => Promise.resolve(true));
    mockSignIn.mockImplementation(() => Promise.resolve(TEST_USER));
    mockVerifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(
      confirmRegistration(TEST_USER_WITH_PASSWORD, "passcode")
    );
    expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignUp).toHaveBeenCalledWith(TEST_EMAIL, "passcode");
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: CONFIRM_REGISTRATION,
      surveyUser: undefined,
    });
  });

  it("confirmSignUp failed", async () => {
    mockConfirmSignUp.mockImplementation(() => Promise.resolve(false));

    await authDispatch(
      confirmRegistration(TEST_USER_WITH_PASSWORD, "passcode")
    );
    expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignUp).toHaveBeenCalledWith(TEST_EMAIL, "passcode");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "Confirm Sign Up Failed",
      authState: CONFIRM_REGISTRATION,
      surveyUser: undefined,
    });
  });

  it("error calling confirmSignUp", async () => {
    mockConfirmSignUp.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(
      confirmRegistration(TEST_USER_WITH_PASSWORD, "passcode")
    );
    expect(mockConfirmSignUp).toHaveBeenCalledTimes(1);
    expect(mockConfirmSignUp).toHaveBeenCalledWith(TEST_EMAIL, "passcode");
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: CONFIRM_REGISTRATION,
      surveyUser: undefined,
    });
  });
});

describe("register", () => {
  beforeEach(() => {
    authDispatch(setAuthState(REGISTER));

    mockVerifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("register and request confirm", async () => {
    mockSignUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_COGNITO_USER })
    );

    await authDispatch(register(TEST_EMAIL, TEST_PASSWORD));
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: CONFIRM_REGISTRATION,
      surveyUser: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        cognitoUser: TEST_COGNITO_USER,
      },
    });
  });

  it("register and signIn success", async () => {
    mockSignUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    mockSignIn.mockImplementation(() => Promise.resolve(TEST_COGNITO_USER));

    await authDispatch(register(TEST_EMAIL, TEST_PASSWORD));
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("register and new password needed", async () => {
    const cognitoUser = {
      ...TEST_COGNITO_USER,
      challengeName: "NEW_PASSWORD_REQUIRED",
    };
    mockSignUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_COGNITO_USER, userConfirmed: true })
    );
    mockSignIn.mockImplementation(() => Promise.resolve(cognitoUser));

    await authDispatch(register(TEST_EMAIL, TEST_PASSWORD));
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: RESET_PASSWORD,
      surveyUser: { email: TEST_EMAIL, cognitoUser },
    });
  });

  it("register as confirmed and confirm registration - shouldn't really happen", async () => {
    mockSignUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    mockSignIn.mockImplementation(() =>
      Promise.reject({
        code: "UserNotConfirmedException",
        message: "error message",
      })
    );

    await authDispatch(register(TEST_EMAIL, TEST_PASSWORD));
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: CONFIRM_REGISTRATION,
      surveyUser: { email: TEST_EMAIL },
    });
  });

  it("register and forgot password", async () => {
    mockSignUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    mockSignIn.mockImplementation(() =>
      Promise.reject({
        code: "PasswordResetRequiredException",
        message: "error message",
      })
    );

    await authDispatch(register(TEST_EMAIL, TEST_PASSWORD));
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: FORGOT_PASSWORD_REQUEST,
      surveyUser: { email: TEST_EMAIL },
    });
  });

  it("register and error calling signIn", async () => {
    mockSignUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    mockSignIn.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(register(TEST_EMAIL, TEST_PASSWORD));
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: REGISTER,
      surveyUser: undefined,
    });
  });

  it("error calling verifiedContact", async () => {
    mockSignUp.mockImplementation(() =>
      Promise.resolve({ user: TEST_USER, userConfirmed: true })
    );
    mockSignIn.mockImplementation(() => Promise.resolve(TEST_USER));
    mockVerifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(register(TEST_EMAIL, TEST_PASSWORD));
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: REGISTER,
      surveyUser: undefined,
    });
  });

  it("signUp failed - return empty result", async () => {
    mockSignUp.mockImplementation(() => Promise.resolve());

    await authDispatch(register(TEST_EMAIL, TEST_PASSWORD));
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "Sign Up Failed",
      authState: REGISTER,
      surveyUser: undefined,
    });
  });

  it("error calling signUp", async () => {
    mockSignUp.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(register(TEST_EMAIL, TEST_PASSWORD));
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(TEST_SIGNUP_ATTRS);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: REGISTER,
      surveyUser: undefined,
    });
  });
});

describe("completeNewPassword", () => {
  beforeEach(() => {
    authDispatch(setAuthState(NEW_PASSWORD_REQUIRED, TEST_USER));

    mockVerifiedContact.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    mockCompleteNewPassword.mockImplementation(() =>
      Promise.resolve(TEST_COGNITO_USER)
    );

    await authDispatch(
      completeNewPassword(TEST_USER_WITH_COGNITO, "new password")
    );

    expect(mockCurrentAuthenticatedUser).not.toHaveBeenCalled();

    expect(mockCompleteNewPassword).toHaveBeenCalledTimes(1);
    expect(mockCompleteNewPassword).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "new password",
      {}
    );
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("success with null user", async () => {
    mockCurrentAuthenticatedUser.mockImplementation(() =>
      Promise.resolve(TEST_COGNITO_USER)
    );
    mockCompleteNewPassword.mockImplementation(() =>
      Promise.resolve(TEST_COGNITO_USER)
    );

    await authDispatch(completeNewPassword(TEST_USER, "new password"));
    expect(mockCurrentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(mockCompleteNewPassword).toHaveBeenCalledTimes(1);
    expect(mockCompleteNewPassword).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "new password",
      {}
    );
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("error calling verifiedContact", async () => {
    mockCompleteNewPassword.mockImplementation(() =>
      Promise.resolve(TEST_COGNITO_USER)
    );
    mockVerifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(
      completeNewPassword(TEST_USER_WITH_COGNITO, "new password")
    );
    expect(mockCompleteNewPassword).toHaveBeenCalledTimes(1);
    expect(mockCompleteNewPassword).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "new password",
      {}
    );
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);

    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: NEW_PASSWORD_REQUIRED,
      surveyUser: TEST_USER,
    });
  });

  it("error calling completeNewPassword", async () => {
    mockCompleteNewPassword.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(
      completeNewPassword(TEST_USER_WITH_COGNITO, "new password")
    );
    expect(mockCompleteNewPassword).toHaveBeenCalledTimes(1);
    expect(mockCompleteNewPassword).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "new password",
      {}
    );
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: NEW_PASSWORD_REQUIRED,
      surveyUser: TEST_USER,
    });
  });

  it("error calling currentAuthenticatedUser", async () => {
    mockCurrentAuthenticatedUser.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(completeNewPassword(TEST_USER, "new password"));
    expect(mockCurrentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: NEW_PASSWORD_REQUIRED,
      surveyUser: TEST_USER,
    });
  });
});

describe("signOut", () => {
  beforeEach(() => {
    authDispatch(setAuthState(SIGNED_IN, TEST_USER));

    mockSignOut.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    await authDispatch(signOut());
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGN_IN,
      surveyUser: undefined,
    });
  });

  it("error calling signOut", async () => {
    mockSignOut.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(signOut());
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: SIGNED_IN,
      surveyUser: TEST_USER,
    });
  });
});

describe("forgotPasswordRequest", () => {
  beforeEach(() => {
    authDispatch(setAuthState(FORGOT_PASSWORD_REQUEST));

    mockForgotPassword.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    await authDispatch(forgotPasswordRequest(TEST_EMAIL));
    expect(mockForgotPassword).toHaveBeenCalledTimes(1);
    expect(mockForgotPassword).toHaveBeenCalledWith(TEST_EMAIL);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: FORGOT_PASSWORD_SUBMIT,
      surveyUser: { email: TEST_EMAIL },
    });
  });

  it("error calling forgotPassword", async () => {
    mockForgotPassword.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(forgotPasswordRequest(TEST_EMAIL));
    expect(mockForgotPassword).toHaveBeenCalledTimes(1);
    expect(mockForgotPassword).toHaveBeenCalledWith(TEST_EMAIL);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: FORGOT_PASSWORD_REQUEST,
      surveyUser: undefined,
    });
  });
});

describe("forgotPasswordSubmit", () => {
  beforeEach(() => {
    authDispatch(
      setAuthState(FORGOT_PASSWORD_SUBMIT, { email: TEST_EMAIL })
    );

    mockForgotPasswordSubmit.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    await authDispatch(
      forgotPasswordSubmit(TEST_EMAIL, "12345", TEST_PASSWORD)
    );
    expect(mockForgotPasswordSubmit).toHaveBeenCalledTimes(1);
    expect(mockForgotPasswordSubmit).toHaveBeenCalledWith(
      TEST_EMAIL,
      "12345",
      TEST_PASSWORD
    );
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGN_IN,
      surveyUser: undefined,
    });
  });

  it("error calling forgotPasswordSubmit", async () => {
    mockForgotPasswordSubmit.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(
      forgotPasswordSubmit(TEST_EMAIL, "12345", TEST_PASSWORD)
    );
    expect(mockForgotPasswordSubmit).toHaveBeenCalledTimes(1);
    expect(mockForgotPasswordSubmit).toHaveBeenCalledWith(
      TEST_EMAIL,
      "12345",
      TEST_PASSWORD
    );
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: FORGOT_PASSWORD_SUBMIT,
      surveyUser: { email: TEST_EMAIL },
    });
  });
});

describe("signInCurrentUser", () => {
  beforeEach(() => {
    authDispatch(setAuthState(FORGOT_PASSWORD_SUBMIT));

    mockCurrentAuthenticatedUser.mockImplementation(() =>
      Promise.resolve(TEST_COGNITO_USER)
    );
  });

  it("success", async () => {
    await authDispatch(signInCurrentUser());
    expect(mockCurrentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: {
        email: TEST_EMAIL,
        cognitoUser: TEST_COGNITO_USER,
      },
    });
  });

  it("no user authenticated", async () => {
    mockCurrentAuthenticatedUser.mockImplementation(() =>
      Promise.reject(new Error("no user authenticated"))
    );

    await authDispatch(signInCurrentUser());
    expect(mockCurrentAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: FORGOT_PASSWORD_SUBMIT,
      surveyUser: undefined,
    });
  });
});

describe("getTOTPSetupQrCode", () => {
  beforeEach(() => {
    authDispatch(setAuthState(REGISTER));

    mockSetupTOTP.mockImplementation((user) =>
      Promise.resolve("secret key for " + user.getUsername())
    );
    mockSetPreferredMFA.mockImplementation(() => Promise.resolve("success"));

    mockQRCodeToDataURL.mockImplementation((key) =>
      Promise.resolve("image data with " + key)
    );
  });

  it("success", () => {
    const expectedData =
      "image data with otpauth://totp/AWSCognito:" +
      TEST_EMAIL +
      "?secret=secret key for " +
      TEST_EMAIL +
      "&issuer=AWSCognito";
    return getTOTPSetupQrCode(TEST_USER_WITH_COGNITO).then((result) => {
      expect(result).toStrictEqual(expectedData);
    });
  });
});

describe("getUserMFA", () => {
  it("mfa TOTP", () => {
    mockGetPreferredMFA.mockImplementation(() =>
      Promise.resolve(SOFTWARE_TOKEN_MFA)
    );

    return getUserMFA(TEST_USER_WITH_COGNITO).then((result) => {
      expect(result).toStrictEqual(MFA_OPTION_TOTP);
      expect(mockGetPreferredMFA).toHaveBeenCalledTimes(1);
      expect(mockGetPreferredMFA).toHaveBeenCalledWith(TEST_COGNITO_USER);
    });
  });

  it("mfa SMS", () => {
    mockGetPreferredMFA.mockImplementation(() => Promise.resolve(SMS_MFA));

    return getUserMFA(TEST_USER_WITH_COGNITO).then((result) => {
      expect(result).toStrictEqual(MFA_OPTION_SMS);
      expect(mockGetPreferredMFA).toHaveBeenCalledTimes(1);
      expect(mockGetPreferredMFA).toHaveBeenCalledWith(TEST_COGNITO_USER);
    });
  });

  it("mfa NOMFA", () => {
    mockGetPreferredMFA.mockImplementation(() => Promise.resolve(NO_MFA));

    return getUserMFA(TEST_USER_WITH_COGNITO).then((result) => {
      expect(result).toStrictEqual(MFA_OPTION_NONE);
      expect(mockGetPreferredMFA).toHaveBeenCalledTimes(1);
      expect(mockGetPreferredMFA).toHaveBeenCalledWith(TEST_COGNITO_USER);
    });
  });
});

describe("verifyTOTPSetup", () => {
  beforeEach(() => {
    authDispatch(setAuthState(TOTP_SETUP, TEST_USER_WITH_COGNITO));

    mockVerifiedContact.mockImplementation(() => Promise.resolve({}));
    mockVerifyTotpToken.mockImplementation(() => Promise.resolve({}));
    mockSetPreferredMFA.mockImplementation(() => Promise.resolve({}));
  });

  it("success", async () => {
    await authDispatch(verifyTOTPSetup(TEST_USER_WITH_COGNITO, "passcode"));
    expect(mockVerifyTotpToken).toHaveBeenCalledTimes(1);
    expect(mockVerifyTotpToken).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "passcode"
    );
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "",
      authState: SIGNED_IN,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("error calling verifiedContact", async () => {
    mockVerifiedContact.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(verifyTOTPSetup(TEST_USER_WITH_COGNITO, "passcode"));
    expect(mockVerifyTotpToken).toHaveBeenCalledTimes(1);
    expect(mockVerifyTotpToken).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "passcode"
    );
    expect(mockVerifiedContact).toHaveBeenCalledTimes(1);
    expect(mockVerifiedContact).toHaveBeenCalledWith(TEST_COGNITO_USER);
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: TOTP_SETUP,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });

  it("error calling verifyTotpToken", async () => {
    mockVerifyTotpToken.mockImplementation(() =>
      Promise.reject(new Error("test error"))
    );

    await authDispatch(verifyTOTPSetup(TEST_USER_WITH_COGNITO, "passcode"));
    expect(mockVerifyTotpToken).toHaveBeenCalledTimes(1);
    expect(mockVerifyTotpToken).toHaveBeenCalledWith(
      TEST_COGNITO_USER,
      "passcode"
    );
    expect(mockVerifiedContact).not.toHaveBeenCalled();
    expect(authStore.getState()).toStrictEqual({
      errorMessage: "test error",
      authState: TOTP_SETUP,
      surveyUser: TEST_USER_WITH_COGNITO,
    });
  });
});
