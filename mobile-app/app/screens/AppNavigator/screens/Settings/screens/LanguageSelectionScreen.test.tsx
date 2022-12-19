import { render } from "@testing-library/react-native";
import { LanguageSelectionScreen } from "./LanguageSelectionScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

describe("language selection screen", () => {
  it("should render", async () => {
    const rendered = render(<LanguageSelectionScreen />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
