import { render } from "@testing-library/react-native";
import { Main } from "./Main";

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

describe("<Main>", () => {
  it("should match snapshot", async () => {
    const component = <Main />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
