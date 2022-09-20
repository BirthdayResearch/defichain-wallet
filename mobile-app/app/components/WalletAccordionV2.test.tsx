import { render } from "@testing-library/react-native";

import { WalletAccordionV2 } from "./WalletAccordionV2";

jest.mock("@shared-contexts/ThemeProvider");

describe("wallet accordion", () => {
  it("should render", async () => {
    const rendered = render(
      <WalletAccordionV2
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
