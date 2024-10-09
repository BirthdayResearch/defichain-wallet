import { AnnouncementText } from "./website";

describe("website", () => {
  it("should check types of AnnouncementText", () => {
    const announcement: AnnouncementText = {
      en: "Good morning",
      it: "Buon giorno",
      "zh-Hans": "Good morning",
      fr: "Good morning",
      es: "Good morning",
      de: "Good morning",
      "zh-Hant": "Good morning",
    };
    expect(typeof announcement.en).toBe("string");
    expect(typeof announcement.it).toBe("string");
    expect(typeof announcement["zh-Hant"]).toBe("string");
    expect(typeof announcement["zh-Hans"]).toBe("string");
    expect(typeof announcement.fr).toBe("string");
    expect(typeof announcement.es).toBe("string");
    expect(typeof announcement.de).toBe("string");
  });
});
