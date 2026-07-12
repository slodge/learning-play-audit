// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { authReducer } from "./model/AuthStore";

// For unit tests
export function getAuthStore() {
  return createStore(authReducer, applyMiddleware(thunk));
}

export const authStore = getAuthStore();

beforeEach(() => {
  jest.resetAllMocks();
});
