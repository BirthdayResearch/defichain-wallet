import { render } from "@testing-library/react-native";

import { WalletAccordion } from "./WalletAccordion";

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

describe("wallet accordion", () => {
  it("should render", async () => {
    const rendered = render(
      <WalletAccordion
        content={[
          {
            title: "foo",
            content: [
              {
                text: "foo",
                type: "paragraph",
              },
              {
                text: "bar",
                type: "bullet",
              },
            ],
          },
        ]}
        title="foo"
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
