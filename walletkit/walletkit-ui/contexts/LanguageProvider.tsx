import "dayjs/locale/de";
import "dayjs/locale/en";
import "dayjs/locale/fr";
import "dayjs/locale/zh";
import "dayjs/locale/es";
import "dayjs/locale/it";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { BaseLogger } from "./logger";

dayjs.extend(localizedFormat);

interface LanguageLoader {
  isLanguageLoaded: boolean;
  language: NonNullable<string>;
}

interface LanguageContextI {
  api: {
    get: () => Promise<string | null>;
    set: (language: NonNullable<string>) => Promise<void>;
  };
  locale?: string;
  logger: BaseLogger;
  onChangeLocale: (locale: string) => void;
}

export function useLanguage({
  api,
  locale,
  logger,
  onChangeLocale,
}: LanguageContextI): LanguageLoader {
  const defaultLanguage = "en";
  const [isLanguageLoaded, setIsLanguageLoaded] = useState<boolean>(false);
  const [language, setLanguage] =
    useState<NonNullable<string>>(defaultLanguage);

  useEffect(() => {
    api
      .get()
      .then((l) => {
        let currentLanguage: NonNullable<string> = defaultLanguage;
        if (l !== null && l !== undefined) {
          currentLanguage = l;
        } else if (locale !== null && locale !== undefined) {
          currentLanguage = locale; // use device's locale on first app install
        }
        setLanguage(currentLanguage);
      })
      .catch((err) => logger.error(err))
      .finally(() => setIsLanguageLoaded(true));
  }, []);

  useEffect(() => {
    onChangeLocale(language);
  }, [language]);

  return {
    isLanguageLoaded,
    language,
  };
}

interface Language {
  language: NonNullable<string>;
  setLanguage: (language: NonNullable<string>) => Promise<void>;
}

const LanguageContext = createContext<Language>(undefined as any);

export function useLanguageContext(): Language {
  return useContext(LanguageContext);
}

export function LanguageProvider(
  props: LanguageContextI & PropsWithChildren<any>,
): JSX.Element | null {
  const { api, children, locale, logger, onChangeLocale } = props;
  const { language } = useLanguage({ api, locale, logger, onChangeLocale });
  const [currentLanguage, setCurrentLanguage] =
    useState<NonNullable<string>>(language);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  useEffect(() => {
    onChangeLocale(currentLanguage);
    switch (currentLanguage) {
      case "de":
        dayjs.locale("de");
        break;
      case "fr":
        dayjs.locale("fr");
        break;
      case "zh-Hans":
      case "zh-Hant":
        dayjs.locale("zh");
        break;
      case "es":
        dayjs.locale("es");
        break;
      case "it":
        dayjs.locale("it");
        break;
      default:
        dayjs.locale("en");
    }
  }, [currentLanguage]);

  const setLanguage = async (newLocale: string): Promise<void> => {
    setCurrentLanguage(newLocale);
    await api.set(newLocale);
  };

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const context: Language = {
    language: currentLanguage,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={context}>
      {children}
    </LanguageContext.Provider>
  );
}
