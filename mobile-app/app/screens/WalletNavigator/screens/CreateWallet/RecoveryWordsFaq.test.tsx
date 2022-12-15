import { render } from "@testing-library/react-native";
import { RecoveryWordsFaq } from "./RecoveryWordsFaq";

describe("recovery words faq", () => {
  it("should match snapshot", () => {
    const rendered = render(<RecoveryWordsFaq />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
