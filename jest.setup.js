global.__reanimatedWorkletInit = jest.fn();

jest.mock("expo-linking", () => {
  const module = {
    ...jest.requireActual("expo-linking"),
    createURL: jest.fn(),
  };

  return module;
});