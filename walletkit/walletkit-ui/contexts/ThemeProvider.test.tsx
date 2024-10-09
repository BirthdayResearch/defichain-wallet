/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";

import { ThemeProvider, useTheme, useThemeContext } from "./ThemeProvider";

const consoleLog = jest.spyOn(console, "log").mockImplementation(jest.fn);
const consoleError = jest.spyOn(console, "error").mockImplementation(jest.fn);
const logger = { error: () => consoleError, info: () => consoleLog };

describe("useTheme hook test", () => {
  it("should pass when theme is not set", async () => {
    const desiredTheme = "dark";
    const api = {
      set: jest.fn(),
      get: async () => null,
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useTheme({
        api,
        colorScheme: desiredTheme,
        logger,
      }),
    );
    await waitForNextUpdate();
    expect(result.current.theme).toBe(desiredTheme);
    expect(result.current.isThemeLoaded).toBe(true);
  });

  it("should pass when theme is already set", async () => {
    const desiredTheme = "dark";
    const api = {
      set: jest.fn(),
      get: async () => desiredTheme,
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useTheme({ api, colorScheme: "light", logger }),
    );
    await waitForNextUpdate();
    expect(result.current.theme).toBe(desiredTheme);
    expect(result.current.isThemeLoaded).toBe(true);
  });

  it("should pass when theme is not set and colorScheme is not defined", async () => {
    const api = {
      set: jest.fn(),
      get: async () => null,
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useTheme({ api, logger }),
    );
    await waitForNextUpdate();
    expect(result.current.theme).toBe("light");
    expect(result.current.isThemeLoaded).toBe(true);
  });
});

describe("ThemeProvider Context test", () => {
  it("should match snapshot", () => {
    function ThemeProviderComponent(): JSX.Element {
      const { isLight, theme } = useThemeContext();
      return (
        <div>
          <span>{isLight.toString()}</span>
          <span>{theme}</span>
        </div>
      );
    }
    const api = {
      set: jest.fn(),
      get: async () => "light",
    };
    const rendered = render(
      <ThemeProvider api={api} colorScheme={jest.fn()}>
        <ThemeProviderComponent />
      </ThemeProvider>,
    );
    expect(rendered).toMatchSnapshot();
  });
});
