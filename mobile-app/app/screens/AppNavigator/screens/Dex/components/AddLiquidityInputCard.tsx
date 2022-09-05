import { View } from "@components";
import { getNativeIcon } from "@components/icons/assets";
import { InputHelperTextV2 } from "@components/InputHelperText";
import { ReservedDFIInfoTextV2 } from "@components/ReservedDFIInfoText";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import {
  AmountButtonTypes,
  TransactionCard,
  TransactionCardStatus,
} from "@components/TransactionCard";
import { WalletTransactionCardTextInput } from "@components/WalletTransactionCardTextInput";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import BigNumber from "bignumber.js";

export function AddLiquidityInputCard(props: {
  balance: BigNumber;
  type: "primary" | "secondary";
  symbol: string;
  onPercentageChange: (amount: string, type: AmountButtonTypes) => void;
  onChange: (amount: string) => void;
  current: string;
  status?: TransactionCardStatus;
  setIsInputFocus: (flag: boolean) => void;
  showInsufficientTokenMsg: boolean;
  showUTXOFeesMsg: boolean;
  hasInputAmount?: boolean;
}): JSX.Element {
  const Icon = getNativeIcon(props.symbol);
  return (
    <>
      <TransactionCard
        maxValue={props.balance}
        onChange={(amount, type) => {
          props.onChange(amount);
          props.onPercentageChange(amount, type);
        }}
        status={props.status}
        amountButtonsStyle={tailwind("border-t-0.5")}
        containerStyle={tailwind("pl-5 pr-5 mr-px rounded-t-lg-v2")}
      >
        <ThemedViewV2
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
          style={tailwind("flex flex-row items-center py-2")}
        >
          <View>
            <Icon height={20} width={20} />
          </View>
          <WalletTransactionCardTextInput
            onFocus={() => props.setIsInputFocus(true)}
            onBlur={() => props.setIsInputFocus(false)}
            onChangeText={(txt) => props.onChange(txt)}
            placeholder="0.00"
            value={props.current}
            inputType="numeric"
            displayClearButton={props.current !== ""}
            onClearButtonPress={() => props.onChange("")}
            titleTestID={`token_input_${props.type}_title`}
            testID={`token_input_${props.type}`}
          />
        </ThemedViewV2>
      </TransactionCard>

      <View
        style={tailwind("pt-0.5 pb-6")}
        testID={`${props.symbol}_display_input_text`}
      >
        {!props.showInsufficientTokenMsg && !props.showUTXOFeesMsg && (
          <InputHelperTextV2
            testID={`token_balance_${props.type}`}
            label={`${translate("screens/AddLiquidity", "Available")}: `}
            content={BigNumber.max(props.balance, 0).toFixed(8)}
            suffix={` ${props.symbol}`}
          />
        )}
        {props.showInsufficientTokenMsg && (
          <ThemedTextV2
            light={tailwind("text-red-v2")}
            dark={tailwind("text-red-v2")}
            style={tailwind("px-4 pt-1 text-xs font-normal-v2")}
            testID={`${props.symbol}_insufficient_token_display_msg`}
          >
            {translate("screens/AddLiquidity", "Insufficient balance")}
          </ThemedTextV2>
        )}
        {!props.showInsufficientTokenMsg && props.showUTXOFeesMsg && (
          <View
            style={tailwind("pl-2 pt-1")}
            testID={`${props.symbol}_reserved_info_text`}
          >
            <ReservedDFIInfoTextV2 />
          </View>
        )}
      </View>
    </>
  );
}
