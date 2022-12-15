import { render } from "@testing-library/react-native";

import { PasscodeFaq } from "./PasscodeFaq";

describe("Passcode FAQ screen", () => {
  it("should match snapshot", async () => {
    const rendered = render(<PasscodeFaq />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
