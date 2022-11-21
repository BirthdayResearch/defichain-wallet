import { render } from "@testing-library/react-native";
import { EnvironmentNetwork } from "@environment";
import {
  FeatureFlagScreen,
  FeatureFlagItem,
  BetaFeaturesI,
} from "./FeatureFlagScreen";

jest.mock("@shared-contexts/ThemeProvider");
jest.mock("@contexts/FeatureFlagContext");

describe("feature flag screen", () => {
  it("should render FeatureFlagItem", async () => {
    const feature: BetaFeaturesI = {
      id: "future_swap",
      name: "Future swap",
      stage: "beta",
      version: ">=0.12.0",
      description: "Browse loan tokens provided by DeFiChain",
      networks: [
        EnvironmentNetwork.LocalPlayground,
        EnvironmentNetwork.RemotePlayground,
      ],
      platforms: ["ios", "android", "web"],
      app: ["MOBILE_LW"],
      value: true,
    };
    const rendered = render(
      <FeatureFlagItem item={feature} onChange={() => {}} />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should render FeatureFlagScreen", async () => {
    const rendered = render(<FeatureFlagScreen />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
