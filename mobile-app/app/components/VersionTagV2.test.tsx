import { render } from "@testing-library/react-native";
import { VersionTagV2 } from "./VersionTagV2";

jest.mock("@shared-contexts/ThemeProvider");

describe("version tag", () => {
  it("should render", async () => {
    const rendered = render(<VersionTagV2 />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
