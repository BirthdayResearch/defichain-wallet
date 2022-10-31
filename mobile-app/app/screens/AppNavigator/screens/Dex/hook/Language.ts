import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useEffect, useState } from "react";

interface Language {
  language: string;
  setLanguage: (val: string) => Promise<void>;
}

export function useLanguageKEK(): Language {
  const logger = useLogger();
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    LanguagePersistence.get()
      .then((lng: string) => {
        setLanguage(lng);
      })
      .catch(logger.error);
  }, []);

  const updateLanguage = async (lang: string): Promise<void> => {
    setLanguage(lang);
    await LanguagePersistence.set(lang);
  };

  return {
    language,
    setLanguage: updateLanguage,
  };
}

const KEY = "i18nextLng=LANGUAGE";

async function set(language: string): Promise<void> {
  await AsyncStorage.setItem(KEY, language);
}

async function get(): Promise<string> {
  const features = (await AsyncStorage.getItem(KEY)) ?? "en";
  return features;
}

export const LanguagePersistence = {
  set,
  get,
};
