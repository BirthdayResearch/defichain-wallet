import { render } from "@testing-library/react-native";
import { VersionTag } from "./VersionTag";

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

describe("version tag", () => {
  it("should render", async () => {
    const rendered = render(<VersionTag />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
