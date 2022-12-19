import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import { RootState } from "@store";
import { loanPaymentTokenActivePrices } from "@store/loans";
import {
  tokenSelectorByDisplaySymbol,
  tokensSelector,
  WalletToken,
} from "@waveshq/walletkit-ui/dist/store";
import { TokenData } from "@defichain/whale-api-client/dist/api/tokens";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { getActivePrice } from "../../Auctions/helpers/ActivePrice";

export interface PaymentTokenProps {
  tokenId: string;
  tokenSymbol: string;
  tokenDisplaySymbol: string;
  tokenBalance: BigNumber;
}

interface GetAmountProps {
  paymentTokenAmounts: Array<{
    amountToPayInLoanToken: BigNumber;
    amountToPayInPaymentToken: BigNumber;
    cappedAmount: BigNumber;
    outstandingBalanceInPaymentToken: BigNumber;
    paymentToken: PaymentTokenProps;
  }>;
}

export const useLoanPaymentTokenRate = (props: {
  loanTokenAmountActivePriceInUSD: BigNumber;
  loanToken: {
    id: string;
    displaySymbol: string;
    symbol: string;
  };
  outstandingBalance: BigNumber;
  amountToPay: BigNumber;
  loanTokenBalance: BigNumber;
}): {
  getPaymentTokens: () => GetAmountProps;
  getPaymentPenalty: (paymentTokenSymbol: string) => BigNumber;
} => {
  const tokens = useSelector((state: RootState) =>
    tokensSelector(state.wallet)
  );
  const DUSDToken = useSelector((state: RootState) =>
    tokenSelectorByDisplaySymbol(state.wallet, "DUSD")
  );
  const paymentTokenActivePrices = useSelector((state: RootState) =>
    loanPaymentTokenActivePrices(state.loans)
  );
  const { isFeatureAvailable } = useFeatureFlagContext();
  const isDUSDPaymentEnabled = isFeatureAvailable("dusd_loan_payment");
  const paymentTokens = _getPaymentTokens(
    {
      ...props.loanToken,
    },
    props.loanTokenBalance,
    tokens,
    DUSDToken,
    isDUSDPaymentEnabled
  );

  const getPaymentPenalty = (paymentTokenSymbol: string): BigNumber => {
    const hasPenalty =
      paymentTokenSymbol === "DFI" ||
      (paymentTokenSymbol === "DUSD" && props.loanToken.symbol !== "DUSD");
    if (!hasPenalty) {
      return new BigNumber(0);
    }

    const penaltyFee =
      props.loanToken.displaySymbol === "DUSD" && paymentTokenSymbol === "DFI"
        ? 0.05
        : 0.01;
    const penaltyOfOutstandingBalance =
      props.outstandingBalance.multipliedBy(penaltyFee);
    const penaltyOfAmountToPay = props.amountToPay.multipliedBy(penaltyFee);

    if (paymentTokenSymbol === props.loanToken.symbol) {
      return BigNumber.max(
        BigNumber.min(penaltyOfOutstandingBalance, penaltyOfAmountToPay),
        0
      );
    }

    return BigNumber.max(
      BigNumber.min(penaltyOfAmountToPay, penaltyOfOutstandingBalance),
      0
    );
  };

  const getPaymentTokens = (): GetAmountProps => {
    const paymentTokenAmounts = paymentTokens.map((paymentToken) => {
      const paymentTokenActivePriceInUSD = getActivePrice(
        paymentToken.tokenSymbol ?? "",
        paymentTokenActivePrices[`${paymentToken.tokenSymbol}-USD`] ?? undefined
      );
      const paymentTokenConversionRate =
        paymentToken.tokenSymbol === props.loanToken.symbol
          ? new BigNumber(1)
          : new BigNumber(props.loanTokenAmountActivePriceInUSD).div(
              paymentTokenActivePriceInUSD
            );

      const loanTokenConversionRate =
        paymentToken.tokenSymbol === props.loanToken.symbol
          ? new BigNumber(1)
          : new BigNumber(paymentTokenActivePriceInUSD).div(
              props.loanTokenAmountActivePriceInUSD
            );
      const amountToPayInLoanToken = props.amountToPay.multipliedBy(
        loanTokenConversionRate
      );
      const outstandingBalanceInLoanToken =
        props.outstandingBalance.multipliedBy(loanTokenConversionRate);
      const cappedAmountInLoanToken = BigNumber.min(
        props.loanTokenBalance,
        outstandingBalanceInLoanToken
      );

      // Payment Token
      const amountToPayInPaymentToken = props.amountToPay;
      const outstandingBalanceInPaymentToken =
        props.outstandingBalance.multipliedBy(paymentTokenConversionRate);
      const cappedAmountInPaymentToken = BigNumber.min(
        paymentToken.tokenBalance,
        outstandingBalanceInPaymentToken
      );

      return {
        amountToPayInLoanToken,
        amountToPayInPaymentToken,
        cappedAmount:
          props.loanToken.symbol !== paymentToken.tokenSymbol
            ? cappedAmountInPaymentToken
            : cappedAmountInLoanToken,
        outstandingBalanceInPaymentToken,
        paymentToken,
      };
    });

    return {
      paymentTokenAmounts,
    };
  };

  return {
    getPaymentTokens,
    getPaymentPenalty,
  };
};

const _getPaymentTokens = (
  loanToken: { id: string; symbol: string; displaySymbol: string },
  tokenBalance: BigNumber,
  tokens: WalletToken[],
  DUSDToken: TokenData | undefined,
  isDUSDPaymentEnabled: boolean
): PaymentTokenProps[] => {
  const paymentTokens = [
    {
      tokenId: loanToken.id,
      tokenSymbol: loanToken.symbol,
      tokenDisplaySymbol: loanToken.displaySymbol,
      tokenBalance: tokenBalance,
    },
  ];

  /*
    Feature: Allow DFI payments on DUSD loans
  */
  if (loanToken.displaySymbol === "DUSD") {
    return [
      ...paymentTokens,
      {
        tokenId: "0_unified",
        tokenSymbol: "DFI",
        tokenDisplaySymbol: "DFI",
        tokenBalance: getTokenAmount("0_unified", tokens),
      },
    ];
  }

  /*
    Feature: Allow DUSD payment on all loans
  */
  return DUSDToken !== undefined && isDUSDPaymentEnabled
    ? [
        ...paymentTokens,
        {
          tokenId: DUSDToken.id,
          tokenSymbol: "DUSD",
          tokenDisplaySymbol: "DUSD",
          tokenBalance: getTokenAmount(DUSDToken.id, tokens),
        },
      ]
    : paymentTokens;
};

export const getTokenAmount = (
  tokenId: string,
  tokens: WalletToken[]
): BigNumber => {
  const reservedDFI = 0.1;
  const id = tokenId === "0" ? "0_unified" : tokenId;
  const tokenAmount = new BigNumber(
    tokens.find((t) => t.id === id)?.amount ?? 0
  );

  return id === "0_unified"
    ? BigNumber.max(tokenAmount.minus(reservedDFI), 0)
    : tokenAmount;
};
