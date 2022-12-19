import { render } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import * as WalletkitUI from "@waveshq/walletkit-ui";
import { useWhaleApiClient, WhaleProvider } from "./WhaleContext";

const networkContext = jest.spyOn(WalletkitUI, "useNetworkContext");
const storeServiceContext = jest.spyOn(
  WalletkitUI,
  "useServiceProviderContext"
);

describe("Whale Context test", () => {
  const networkDetails = [
    {
      url: "https://ocean.defichain.com",
      network: "mainnet",
      name: EnvironmentNetwork.MainNet,
    },
    {
      url: "https://ocean.defichain.com",
      network: "testnet",
      name: EnvironmentNetwork.TestNet,
    },
    {
      url: "https://playground.jellyfishsdk.com",
      network: "regtest",
      name: EnvironmentNetwork.RemotePlayground,
    },
    {
      url: "http://localhost:19553",
      network: "regtest",
      name: EnvironmentNetwork.LocalPlayground,
    },
  ];

  networkDetails.forEach((networkDetail) => {
    describe(`Whale Context test for ${networkDetail.name}`, () => {
      it("should match snapshot", () => {
        networkContext.mockImplementation(() => ({
          network: networkDetail.name,
        }));
        storeServiceContext.mockImplementation(() => ({
          url: networkDetail.url,
          isCustomUrl: false,
        }));
        function WhaleProviderComponent(): JSX.Element {
          const client = useWhaleApiClient();
          expect(Object.keys(client)).toEqual(
            expect.arrayContaining([
              "options",
              "rpc",
              "address",
              "poolpairs",
              "transactions",
              "tokens",
              "masternodes",
              "blocks",
              "oracles",
              "prices",
              "stats",
              "rawtx",
              "fee",
              "loan",
            ])
          );
          const options = {
            version: "v0",
            timeout: 60000,
            url: networkDetail.url,
            network: networkDetail.network,
          };
          expect(client.options).toMatchObject(options);
          return (
            <View>
              <Text>{JSON.stringify(client.options)}</Text>
            </View>
          );
        }

        const rendered = render(
          <WhaleProvider>
            <WhaleProviderComponent />
          </WhaleProvider>
        );
        expect(rendered.toJSON()).toMatchSnapshot();
      });
    });
  });
});
