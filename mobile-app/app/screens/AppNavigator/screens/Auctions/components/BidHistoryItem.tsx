import { View } from "react-native";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import BigNumber from "bignumber.js";
import { NumericFormat as NumberFormat } from "react-number-format";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { fromScriptHex } from "@defichain/jellyfish-address";
import { useNetworkContext } from "@shared-contexts/NetworkContext";
import { useBidTimeAgo } from "../hooks/BidTimeAgo";
import { ActiveUSDValueV2 } from "../../Loans/VaultDetail/components/ActiveUSDValueV2";

interface BidHistoryItemProps {
  bidIndex: number;
  bidAmount: string;
  loanDisplaySymbol: string;
  bidderAddress: string;
  bidAmountInUSD: BigNumber;
  bidBlockTime: number;
}

export function BidHistoryItem({
  bidIndex,
  bidAmount,
  loanDisplaySymbol,
  bidderAddress,
  bidAmountInUSD,
  bidBlockTime,
}: BidHistoryItemProps): JSX.Element {
  const bidTime = useBidTimeAgo(bidBlockTime);
  const { address } = useWalletContext();
  const network = useNetworkContext();
  const decodedBidderAddress = fromScriptHex(
    bidderAddress,
    network.networkName
  );

  return (
    <ThemedViewV2
      light={tailwind("bg-mono-light-v2-00")}
      dark={tailwind("bg-mono-dark-v2-00")}
      style={tailwind("rounded-lg-v2 px-5 py-4 mb-2 mx-5")}
      testID={`bid_${bidIndex.toString()}`}
    >
      <View style={tailwind("flex flex-row justify-between mb-1 items-start")}>
        <ThemedTextV2
          style={tailwind("text-xs font-semibold-v2")}
          light={tailwind("text-mono-light-v2-800")}
          dark={tailwind("text-mono-dark-v2-800")}
        >
          {translate("components/BidHistory", "BID#{{bidIndex}}", {
            bidIndex: bidIndex,
          })}
          {decodedBidderAddress?.address === address &&
            ` ${translate("components/BidHistory", "(Yours)")}`}
        </ThemedTextV2>
        <NumberFormat
          value={bidAmount}
          thousandSeparator
          decimalScale={8}
          suffix={` ${loanDisplaySymbol}`}
          fixedDecimalScale
          displayType="text"
          renderText={(value) => (
            <ThemedTextV2
              style={tailwind("text-sm font-normal-v2")}
              testID={`bid_${loanDisplaySymbol}_amount`}
            >
              {value}
            </ThemedTextV2>
          )}
        />
      </View>
      <View style={tailwind("flex flex-row justify-between items-center")}>
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
          style={tailwind("text-xs font-normal-v2")}
        >
          {bidTime}
        </ThemedTextV2>
        <ActiveUSDValueV2 price={bidAmountInUSD} />
      </View>
    </ThemedViewV2>
  );
}
