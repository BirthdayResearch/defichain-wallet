import { render } from "@testing-library/react-native";
import { TotalValueLocked } from "./TotalValueLocked";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
  useRoute: () => ({
    params: {},
  }),
}));

describe("Total Value Locked", () => {
  it("should match snapshot", async () => {
    const component = <TotalValueLocked tvl={123} />;
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
