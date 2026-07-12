// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

const DB_TABLE = "dbtable-responses";

process.env.REACT_APP_AWS_REGION = "eu-west-2";
process.env.REACT_APP_AWS_SURVEY_RESPONSES_TABLE = DB_TABLE;

beforeEach(() => {
  jest.resetAllMocks();
});
