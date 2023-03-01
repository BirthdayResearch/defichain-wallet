import { translate } from "@translations";
import {
  CTransactionSegWit,
  PlaceAuctionBid,
} from "@defichain/jellyfish-transaction/dist";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { useSelector } from "react-redux";
import { RootState } from "@store";
import {
  hasTxQueued,
  transactionQueue,
  firstTransactionSelector,
  hasOceanTXQueued,
  OceanTransaction,
} from "@waveshq/walletkit-ui/dist/store";
import { useAppDispatch } from "@hooks/useAppDispatch";

interface ConstructSignedBidAndSendProps {
  vaultId: PlaceAuctionBid["vaultId"];
  index: PlaceAuctionBid["index"];
  tokenAmount: PlaceAuctionBid["tokenAmount"];
  displaySymbol: string;
  onBroadcast: () => void;
}

export const useSignBidAndSend = (): {
  hasPendingJob: boolean;
  hasPendingBroadcastJob: boolean;
  currentBroadcastJob: OceanTransaction;
  constructSignedBidAndSend: (
    props: ConstructSignedBidAndSendProps
  ) => Promise<void>;
} => {
  const dispatch = useAppDispatch();
  const logger = useLogger();
  const hasPendingJob = useSelector((state: RootState) =>
    hasTxQueued(state.transactionQueue)
  );
  const hasPendingBroadcastJob = useSelector((state: RootState) =>
    hasOceanTXQueued(state.ocean)
  );
  const currentBroadcastJob = useSelector((state: RootState) =>
    firstTransactionSelector(state.ocean)
  );

  async function constructSignedBidAndSend(
    props: ConstructSignedBidAndSendProps
  ): Promise<void> {
    try {
      const signer = async (
        account: WhaleWalletAccount
      ): Promise<CTransactionSegWit> => {
        const builder = account.withTransactionBuilder();
        const script = await account.getScript();
        const bid: PlaceAuctionBid = {
          from: script,
          vaultId: props.vaultId,
          index: props.index,
          tokenAmount: {
            token: Number(props.tokenAmount.token),
            amount: props.tokenAmount.amount,
          },
        };
        const dfTx = await builder.loans.placeAuctionBid(bid, script);

        return new CTransactionSegWit(dfTx);
      };

      dispatch(
        transactionQueue.actions.push({
          sign: signer,
          title: translate(
            "components/QuickBid",
            "Placing {{amount}} {{token}} quick bid",
            {
              amount: props.tokenAmount.amount,
              token: props.displaySymbol,
            }
          ),
          drawerMessages: {
            preparing: translate(
              "screens/OceanInterface",
              "Preparing to place bid…"
            ),
            waiting: translate(
              "components/QuickBid",
              "Placing {{amount}} {{token}} quick bid",
              {
                amount: props.tokenAmount.amount,
                token: props.displaySymbol,
              }
            ),
            complete: translate(
              "components/QuickBid",
              "Placed {{amount}} {{token}} quick bid",
              {
                amount: props.tokenAmount.amount,
                token: props.displaySymbol,
              }
            ),
          },
          onBroadcast: props.onBroadcast,
        })
      );
    } catch (e) {
      logger.error(e);
    }
  }

  return {
    hasPendingJob,
    hasPendingBroadcastJob,
    currentBroadcastJob,
    constructSignedBidAndSend,
  };
};
