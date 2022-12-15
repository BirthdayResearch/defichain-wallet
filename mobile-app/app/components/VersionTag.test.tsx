import { render } from "@testing-library/react-native";
import { VersionTag } from "./VersionTag";

describe("version tag", () => {
  it("should render", async () => {
    const rendered = render(<VersionTag />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
