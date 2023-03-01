import { render } from "@testing-library/react-native";
import { Main } from "./Main";

describe("<Main>", () => {
  it("should match snapshot", async () => {
    const component = <Main />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
