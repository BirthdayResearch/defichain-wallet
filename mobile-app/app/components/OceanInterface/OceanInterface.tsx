import {
  getMetaScanTxUrl,
  useDeFiScanContext,
} from "@shared-contexts/DeFiScanContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import {
  useNetworkContext,
  useWhaleApiClient,
} from "@waveshq/walletkit-ui/dist/contexts";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction/dist";
import { WhaleApiClient } from "@defichain/whale-api-client";
import { Transaction } from "@defichain/whale-api-client/dist/api/transactions";
import { EnvironmentNetwork, getEnvironment } from "@waveshq/walletkit-core";
import { RootState } from "@store";
import {
  firstTransactionSelector,
  ocean,
  OceanTransaction,
  TransactionStatusCode,
} from "@waveshq/walletkit-ui/dist/store";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useSelector } from "react-redux";
import {
  NativeLoggingProps,
  useLogger,
} from "@shared-contexts/NativeLoggingProvider";
import { getReleaseChannel } from "@api/releaseChannel";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { TransactionDetail } from "./TransactionDetail";
import { TransactionError } from "./TransactionError";

const MAX_AUTO_RETRY = 1;
const MAX_TIMEOUT = 300000;
const INTERVAL_TIME = 5000;

enum VmmapTypes {
  Auto = 0,
  BlockNumberDVMToEVM = 1,
  BlockNumberEVMToDVM = 2,
  BlockHashDVMToEVM = 3,
  BlockHashEVMToDVM = 4,
  TxHashDVMToEVM = 5,
  TxHasEVMToDVM = 6,
}

interface VmmapResult {
  input: string;
  type: string;
  output: string;
}

async function broadcastTransaction(
  tx: CTransactionSegWit,
  client: WhaleApiClient,
  retries: number = 0,
  logger: NativeLoggingProps,
): Promise<string> {
  try {
    return await client.rawtx.send({ hex: tx.toHex() });
  } catch (e) {
    logger.error(e);
    if (retries < MAX_AUTO_RETRY) {
      return await broadcastTransaction(tx, client, retries + 1, logger);
    }
    throw e;
  }
}

async function waitForTxConfirmation(
  id: string,
  client: WhaleApiClient,
  logger: NativeLoggingProps,
): Promise<Transaction> {
  const initialTime = getEnvironment(getReleaseChannel()).debug ? 5000 : 30000;
  let start = initialTime;

  return await new Promise((resolve, reject) => {
    let intervalID: NodeJS.Timeout;
    const callTransaction = (): void => {
      client.transactions
        .get(id)
        .then((tx) => {
          if (intervalID !== undefined) {
            clearInterval(intervalID);
          }
          resolve(tx);
        })
        .catch((e) => {
          if (start >= MAX_TIMEOUT) {
            logger.error(e);
            if (intervalID !== undefined) {
              clearInterval(intervalID);
            }
            reject(e);
          }
        });
    };
    setTimeout(() => {
      callTransaction();
      intervalID = setInterval(() => {
        start += INTERVAL_TIME;
        callTransaction();
      }, INTERVAL_TIME);
    }, initialTime);
  });
}

/**
 * @description - Global component to be used for async calls, network errors etc. This component is positioned above the bottom tab.
 *  Need to get the height of bottom tab via `useBottomTabBarHeight()` hook to be called on screen.
 * */
export function OceanInterface(): JSX.Element | null {
  const logger = useLogger();
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();
  const { wallet, address } = useWalletContext();
  const { getTransactionUrl } = useDeFiScanContext();
  const { network } = useNetworkContext();
  const { isFeatureAvailable } = useFeatureFlagContext();
  const isSaveTxEnabled = isFeatureAvailable("save_tx");

  // store
  const { height, err: e } = useSelector((state: RootState) => state.ocean);
  const transaction = useSelector((state: RootState) =>
    firstTransactionSelector(state.ocean),
  );
  const slideAnim = useRef(new Animated.Value(0)).current;
  // state
  const [tx, setTx] = useState<OceanTransaction | undefined>(transaction);
  const [calledTx, setCalledTx] = useState<string | undefined>();
  const [err, setError] = useState<string | undefined>(e?.message);
  const [txUrl, setTxUrl] = useState<string | undefined>();
  // evm tx state
  const [evmTxId, setEvmTxId] = useState<string>();
  const [evmTxUrl, setEvmTxUrl] = useState<string>();

  const dismissDrawer = useCallback(() => {
    setTx(undefined);
    setError(undefined);
    slideAnim.setValue(0);
  }, [slideAnim]);

  const getEvmTxId = async (oceanTxId: string) => {
    const vmmap: VmmapResult = await client.rpc.call(
      "vmmap",
      [oceanTxId, VmmapTypes.TxHashDVMToEVM],
      "lossless",
    );
    return vmmap.output;
  };

  useEffect(() => {
    const saveTx = async (txId: string) => {
      try {
        await fetch(
          `https://3paxhqj3np.ap-southeast-1.awsapprunner.com/transaction/${txId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transaction: txId,
            }),
          },
        );
        // store called transaction
        setCalledTx(txId);
      } catch (e) {
        /* empty - don't do anything even if saveTx is not called */
      }
    };
    if (
      tx?.broadcasted && // only call tx when tx is done
      calledTx !== tx?.tx.txId && // to ensure that api is only called once per tx
      tx?.tx.txId !== undefined &&
      network === EnvironmentNetwork.MainNet &&
      isSaveTxEnabled // feature flag
    ) {
      saveTx(tx.tx.txId);
    }
  }, [tx?.tx.txId, calledTx, tx?.broadcasted, network, isSaveTxEnabled]);

  useEffect(() => {
    // get evm tx id and url (if any)
    const fetchEvmTx = async (txId: string) => {
      try {
        const mappedEvmTxId = await getEvmTxId(txId);
        const txUrl = getMetaScanTxUrl(network, mappedEvmTxId);
        setEvmTxId(mappedEvmTxId);
        setEvmTxUrl(txUrl);
      } catch (error) {
        logger.error(error);
      }
    };

    if (tx !== undefined) {
      const isTransferDomainTx = tx?.tx.vout.some(
        (vout) =>
          vout.script?.stack.some(
            (item: any) =>
              item.type === "OP_DEFI_TX" &&
              item.tx?.name === "OP_DEFI_TX_TRANSFER_DOMAIN",
          ),
      );
      if (isTransferDomainTx) {
        fetchEvmTx(tx.tx.txId);
      }
    } else {
      setEvmTxId(undefined);
      setEvmTxUrl(undefined);
    }
  }, [tx]);

  useEffect(() => {
    // last available job will remained in this UI state until get dismissed
    if (transaction !== undefined) {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setTx({
        ...transaction,
        broadcasted: false,
        title:
          transaction.drawerMessages?.preparing ??
          translate("screens/OceanInterface", "Preparing broadcast"),
      });
      broadcastTransaction(transaction.tx, client, 0, logger)
        .then(async () => {
          try {
            setTxUrl(
              getTransactionUrl(transaction.tx.txId, transaction.tx.toHex()),
            );
          } catch (e) {
            logger.error(e);
          }
          setTx({
            ...transaction,
            title:
              transaction.drawerMessages?.waiting ??
              translate("screens/OceanInterface", "Waiting for transaction"),
          });
          if (transaction.onBroadcast !== undefined) {
            transaction.onBroadcast();
          }
          let title;
          let oceanStatusCode: TransactionStatusCode;
          try {
            await waitForTxConfirmation(transaction.tx.txId, client, logger);
            title =
              transaction.drawerMessages?.complete ??
              translate("screens/OceanInterface", "Transaction confirmed");
            oceanStatusCode = TransactionStatusCode.success;
          } catch (e) {
            logger.error(e);
            title = translate(
              "screens/OceanInterface",
              "Sent (Pending confirmation)",
            );
            oceanStatusCode = TransactionStatusCode.pending;
          }
          setTx({
            ...transaction,
            title,
            broadcasted: true,
            oceanStatusCode,
          });
          if (transaction.onConfirmation !== undefined) {
            transaction.onConfirmation();
          }
        })
        .catch((e: Error) => {
          const errMsg = `${e.message}. Txid: ${transaction.tx.txId}`;
          setError(errMsg);
          logger.error(e);
          if (transaction.onError !== undefined) {
            transaction.onError();
          }
        })
        .finally(() => {
          dispatch(ocean.actions.popTransaction());
        }); // remove the job as soon as completion
    }
  }, [transaction, wallet, address]);

  // If there are any explicit errors to be displayed
  useEffect(() => {
    if (e !== undefined) {
      setError(e.message);
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [e]);

  if (tx === undefined && err === undefined) {
    return null;
  }

  return (
    <Animated.View
      style={[
        tailwind("px-5 py-3 flex-row absolute w-full items-center z-10"),
        {
          bottom: slideAnim,
          minHeight: 75,
        },
      ]}
    >
      {err !== undefined ? (
        <TransactionError errMsg={err} onClose={dismissDrawer} />
      ) : (
        tx !== undefined && (
          <TransactionDetail
            broadcasted={tx.broadcasted}
            onClose={dismissDrawer}
            title={tx.title}
            oceanStatusCode={tx.oceanStatusCode}
            txUrl={txUrl}
            txid={tx.tx.txId}
            evmTxId={evmTxId}
            evmTxUrl={evmTxUrl}
          />
        )
      )}
    </Animated.View>
  );
}
