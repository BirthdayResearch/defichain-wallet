/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";

import {
  LanguageProvider,
  useLanguage,
  useLanguageContext,
} from "./LanguageProvider";

const consoleLog = jest.spyOn(console, "log").mockImplementation(jest.fn);
const consoleError = jest.spyOn(console, "error").mockImplementation(jest.fn);
const logger = { error: () => consoleError, info: () => consoleLog };
const onChangeLocale = jest.fn();

describe("useLanguage hook test", () => {
  it("should pass when it uses users devices locale on first app install", async () => {
    const api = {
      set: jest.fn(),
      get: async () => null,
    };
    const desiredLanguage = "fr";
    const { result, waitForNextUpdate } = renderHook(() =>
      useLanguage({
        api,
        locale: desiredLanguage,
        logger,
        onChangeLocale,
      }),
    );
    await waitForNextUpdate();
    expect(result.current.language).toBe(desiredLanguage);
    expect(result.current.isLanguageLoaded).toBe(true);
  });

  it("should pass when use already selected language", async () => {
    const desiredLanguage = "fr";
    const api = {
      set: jest.fn(),
      get: async () => desiredLanguage,
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useLanguage({ api, locale: "en", logger, onChangeLocale }),
    );
    await waitForNextUpdate();
    expect(result.current.language).toBe(desiredLanguage);
    expect(result.current.isLanguageLoaded).toBe(true);
  });

  it("should pass when no language is selected or dont find any language on users device", async () => {
    const api = {
      set: jest.fn(),
      get: async () => null,
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useLanguage({ api, logger, onChangeLocale }),
    );
    await waitForNextUpdate();
    expect(result.current.language).toBe("en");
    expect(result.current.isLanguageLoaded).toBe(true);
  });
});

describe("LanguageProvider Context test", () => {
  it("should match snapshot", async () => {
    function ThemeProviderComponent(): JSX.Element {
      const { language } = useLanguageContext();
      return (
        <div>
          <span>{language}</span>
        </div>
      );
    }
    const api = {
      set: jest.fn(),
      get: async () => "fr",
    };
    const rendered = render(
      <LanguageProvider
        api={api}
        onChangeLocale={onChangeLocale}
        logger={logger}
      >
        <ThemeProviderComponent />
      </LanguageProvider>,
    );
    expect(rendered).toMatchSnapshot();
  });
});
