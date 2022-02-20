import {
  screen,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { render, unmountComponentAtNode } from "react-dom";
import userEvent from "@testing-library/user-event";

import axios from "axios";
import App from "./App";

jest.mock("axios");

const repo_one = {
  id: 1,
  name: "Some name",
  description: "Some description",
  language: "Some language",
  stargazers_count: 1,
  html_link: "https://some-example.com",
};

const repo_two = {
  id: 2,
  name: "Other name",
  description: "Other description",
  language: "Other language",
  stargazers_count: 2,
  html_link: "https://other-example.com",
};

const response = {
  data: {
    items: [repo_one],
  },
};

const multi_response = {
  data: {
    items: [repo_one, repo_two],
  },
};

const empty_response = { data: { items: [] } };

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it("renders table", async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(response));

  render(<App />, container);
  await waitForElementToBeRemoved(() => screen.queryByText(/loading.../i));

  const table = screen.getByTestId("data-table");
  const [columnNames, ...rows] = within(table).getAllByRole("rowgroup");

  // expect table with columns and rows
  expect(within(columnNames).getByText(/name/i)).toBeInTheDocument();
  expect(within(columnNames).getByText(/description/i)).toBeInTheDocument();
  expect(within(columnNames).getByText(/link/i)).toBeInTheDocument();
  expect(within(columnNames).getByText(/stars/i)).toBeInTheDocument();
  expect(within(columnNames).getByText(/favorite/i)).toBeInTheDocument();

  const results = rows.map((row) => {
    return within(row).getByRole("row").textContent;
  });

  expect(results).toMatchInlineSnapshot(`
        Array [
          "1Some nameSome descriptionlink1☆",
        ]
      `);
});

it("renders no table", async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(empty_response));

  render(<App />, container);
  await waitForElementToBeRemoved(() => screen.queryByText(/loading.../i));

  // expect no table
  const linkElement = screen.getByText(/no rows to display/i);
  expect(linkElement).toBeInTheDocument();
});

it("changes favorite flag", async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(response));

  render(<App />, container);
  await waitForElementToBeRemoved(() => screen.queryByText(/loading.../i));

  // press the favorite button
  const before = screen.getByRole("button", { name: /☆/i });
  expect(before).toBeInTheDocument();
  userEvent.click(before);

  // expect favorite to be set
  const after = screen.getByRole("button", { name: /⭐/i });
  expect(after).toBeInTheDocument();
});

it("set favorite filter", async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(response));

  render(<App />, container);
  await waitForElementToBeRemoved(() => screen.queryByText(/loading.../i));

  // press the favorites filter
  const filter = screen.getByTestId("favorite-checkbox");
  expect(filter).not.toBeChecked();
  userEvent.click(filter);
  expect(filter).toBeChecked();
});

it("set favorite filter with favorites", async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(response));

  render(<App />, container);
  await waitForElementToBeRemoved(() => screen.queryByText(/loading.../i));

  // expect the table
  const table = screen.getByTestId("data-table");
  expect(table).toBeInTheDocument();

  // press the favorites filter
  const filter = screen.getByTestId("favorite-checkbox");
  expect(filter).not.toBeChecked();
  userEvent.click(filter);
  expect(filter).toBeChecked();

  // expect no table
  const linkElement = screen.getByText(/no rows to display/i);
  expect(linkElement).toBeInTheDocument();
});

it("set favorite filter no favorites", async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(response));

  render(<App />, container);
  await waitForElementToBeRemoved(() => screen.queryByText(/loading.../i));

  // press the favorite button on row
  const favorite_button = screen.getByTestId("favorite-button", { name: /☆/i });
  expect(favorite_button).toBeInTheDocument();
  userEvent.click(favorite_button);

  // press the favorites filter
  const filter = screen.getByTestId("favorite-checkbox");
  expect(filter).not.toBeChecked();
  userEvent.click(filter);
  expect(filter).toBeChecked();

  // expect table to be displayed
  const table = screen.getByTestId("data-table");
  expect(table).toBeInTheDocument();
});

it("set language filter", async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(response));

  render(<App />, container);
  await waitForElementToBeRemoved(() => screen.queryByText(/loading.../i));

  // select the language filter
  userEvent.selectOptions(screen.getByTestId("language-select"), [
    "Some language",
  ]);

  // expect 'Some language' to be selected
  expect(screen.getByRole("option", { name: /any language/i }).selected).toBe(
    false
  );
  expect(screen.getByRole("option", { name: /some language/i }).selected).toBe(
    true
  );

  // expect table to be displayed
  const table = screen.getByTestId("data-table");
  expect(table).toBeInTheDocument();
});
