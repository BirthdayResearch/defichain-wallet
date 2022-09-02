import { render } from "@testing-library/react-native";
import { Main } from "./Main";

jest.mock("@shared-contexts/ThemeProvider");

describe.skip("<Main>", () => {
  it("should match snapshot", async () => {
    const component = <Main />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
