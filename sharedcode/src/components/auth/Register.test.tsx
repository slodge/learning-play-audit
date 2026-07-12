import React from "react";
import Register from "./Register";
import { SET_AUTH_STATE, SET_AUTH_ERROR } from "../../model/AuthActionTypes";
import { SIGN_IN, REGISTER } from "../../model/AuthStates";
import { setAuthState, register } from "../../model/AuthActions";
import { renderWithStore } from "./TestUtils";
import { authStore } from "../../setupTests";
import { waitFor } from "@testing-library/react";

const TEST_EMAIL = "test@example.com";

const EMAIL_LABEL = "Email Address*";
const PASSWORD_LABEL = "Password (minimum 8 characters)*";

jest.mock("../../model/AuthActions");

describe("component Register", () => {
  beforeEach(() => {
    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: REGISTER,
      surveyUser: { email: TEST_EMAIL },
    });

    (register as jest.Mock).mockImplementation(() => () => "dummy action");
    (setAuthState as jest.Mock).mockImplementation(() => () => "dummy action");
  });

  it("initial render and enable register action", async () => {
    const { container, getByLabelText, user } = renderWithStore(<Register />);

    const emailInput = getByLabelText(EMAIL_LABEL);
    const passwordInput = getByLabelText(PASSWORD_LABEL);
    const tncCheck = container.querySelector("#tnc-check")!;
    const gdprCheck = container.querySelector("#gdpr-check")!;
    const cookieCheck = container.querySelector("#cookie-check")!;
    const registerButton = container.querySelector("#register-button");

    expect(emailInput).toHaveDisplayValue("");
    expect(passwordInput).toHaveDisplayValue("");
    expect(tncCheck).not.toHaveClass("checked");
    expect(gdprCheck).not.toHaveClass("checked");
    expect(cookieCheck).not.toHaveClass("checked");
    expect(registerButton).toBeDisabled();

    // Form complete
    await user.type(emailInput, TEST_EMAIL);
    await user.type(passwordInput, "12345678");
    await user.click(tncCheck);
    await user.click(gdprCheck);
    await user.click(cookieCheck);
    expect(registerButton).not.toBeDisabled();

    // Email empty
    await user.clear(emailInput);
    expect(registerButton).toBeDisabled();

    // Restore
    await user.type(emailInput, TEST_EMAIL);
    expect(registerButton).not.toBeDisabled();

    // Password empty
    await user.clear(passwordInput);
    expect(registerButton).toBeDisabled();

    // Restore
    await user.type(passwordInput, "12345678");
    expect(registerButton).not.toBeDisabled();

    // Password too short
    await user.clear(passwordInput);
    await user.type(passwordInput, "1234567");
    expect(registerButton).toBeDisabled();

    // Restore
    await user.type(passwordInput, "12345678");
    expect(registerButton).not.toBeDisabled();

    // TnC unchecked
    await user.click(tncCheck);
    expect(registerButton).toBeDisabled();

    // Restore
    await user.click(tncCheck);
    expect(registerButton).not.toBeDisabled();

    // GDPR unchecked
    await user.click(gdprCheck);
    expect(registerButton).toBeDisabled();

    // Restore
    await user.click(gdprCheck);
    expect(registerButton).not.toBeDisabled();

    // Cookie unchecked
    await user.click(cookieCheck);
    expect(registerButton).toBeDisabled();

    // Restore
    await user.click(cookieCheck);
    expect(registerButton).not.toBeDisabled();
  });

  it("confirm success", async () => {
    const { container, getByLabelText, user } = renderWithStore(<Register />);
    const registerButton = container.querySelector("#register-button")!;
    await user.type(getByLabelText(EMAIL_LABEL), TEST_EMAIL);
    await user.type(getByLabelText(PASSWORD_LABEL), "12345678");
    await user.click(container.querySelector("#tnc-check")!);
    await user.click(container.querySelector("#gdpr-check")!);
    await user.click(container.querySelector("#cookie-check")!);
    await user.click(registerButton);

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(TEST_EMAIL, "12345678");
    expect(registerButton).toBeDisabled();
  });

  it("back to sign in", async () => {
    const { container, user } = renderWithStore(<Register />);
    await user.click(container.querySelector("#signin-button")!);

    expect(setAuthState).toHaveBeenCalledTimes(1);
    expect(setAuthState).toHaveBeenCalledWith(SIGN_IN);
  });

  it("end loading spinner on auth state update", async () => {
    const { container, getByLabelText, user } = renderWithStore(<Register />);
    const registerButton = container.querySelector("#register-button")!;
    await user.type(getByLabelText(EMAIL_LABEL), TEST_EMAIL);
    await user.type(getByLabelText(PASSWORD_LABEL), "12345678");
    await user.click(container.querySelector("#tnc-check")!);
    await user.click(container.querySelector("#gdpr-check")!);
    await user.click(container.querySelector("#cookie-check")!);
    await user.click(registerButton);

    expect(registerButton).toBeDisabled();

    authStore.dispatch({
      type: SET_AUTH_STATE,
      authState: SIGN_IN,
      surveyUser: { email: TEST_EMAIL },
    });
    await waitFor(() => expect(registerButton).not.toBeDisabled());
  });

  it("end loading spinner on auth error", async () => {
    const { container, getByLabelText, user } = renderWithStore(<Register />);
    const registerButton = container.querySelector("#register-button")!;
    await user.type(getByLabelText(EMAIL_LABEL), TEST_EMAIL);
    await user.type(getByLabelText(PASSWORD_LABEL), "12345678");
    await user.click(container.querySelector("#tnc-check")!);
    await user.click(container.querySelector("#gdpr-check")!);
    await user.click(container.querySelector("#cookie-check")!);
    await user.click(registerButton);

    expect(registerButton).toBeDisabled();

    authStore.dispatch({ type: SET_AUTH_ERROR, message: "test error" });
    await waitFor(() => expect(registerButton).not.toBeDisabled());
  });

  it("gdpr popup", async () => {
    const { getByRole, user } = renderWithStore(<Register />);

    expect(gdprPopup()).toBeNull();

    await user.click(getByRole("button", { name: "GDPR details" }));
    expect(gdprPopup()).not.toBeNull();

    // Click close
    await user.click(getByRole("button", { name: "Close" }));
    expect(gdprPopup()).toBeNull();

    //  Open again
    await user.click(getByRole("button", { name: "GDPR details" }));
    expect(gdprPopup()).not.toBeNull();

    // Click backdrop
    const backdrop = document.querySelector(
      "#popup-container div:first-child"
    )!;
    await user.click(backdrop);
    expect(gdprPopup()).toBeNull();
  });

  const gdprPopup = () => document.querySelector(".tooltip-popup");
});
