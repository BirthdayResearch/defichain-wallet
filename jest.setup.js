global.__reanimatedWorkletInit = jest.fn();
process.env.EXPO_OS = process.env.EXPO_OS || "web";

jest.mock("react-qr-code", () => {
  const React = require("react");
  const { View } = require("react-native");

  return function MockQrCode(props) {
    return React.createElement(View, {
      testID: props.testID || "mock_qr_code",
      accessibilityLabel: props.value,
    });
  };
});

jest.mock("expo-linking", () => {
  const module = {
    ...jest.requireActual("expo-linking"),
    createURL: jest.fn(),
  };

  return module;
});

global.window.matchMedia = global.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
}
