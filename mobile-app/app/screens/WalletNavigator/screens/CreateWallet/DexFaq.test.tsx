import { render } from "@testing-library/react-native";
import { DexFaq } from "./DexFaq";

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");
describe("DEX FAQ screen", () => {
  it("should match snapshot", async () => {
    const rendered = render(<DexFaq />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
