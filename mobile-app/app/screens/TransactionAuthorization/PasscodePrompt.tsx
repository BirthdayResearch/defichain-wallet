import {
  ThemedActivityIndicatorV2,
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { DfTxSigner } from "@store/transaction_queue";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { Platform, SafeAreaView, View } from "react-native";
import {
  TransactionStatus,
  USER_CANCELED,
} from "@screens/TransactionAuthorization/api/transaction_types";
import {
  BottomSheetBackdropProps,
  BottomSheetBackgroundProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as React from "react";
import Modal from "react-overlays/Modal";
import { PinTextInputV2 } from "@components/PinTextInputV2";

interface PasscodePromptProps {
  onCancel: (err: string) => void;
  title: string;
  message: string;
  transaction: DfTxSigner;
  status: TransactionStatus;
  pinLength: number;
  onPinInput: (pin: string) => void;
  pin: string;
  loadingMessage: string;
  authorizedTransactionMessage: { title: string; description: string };
  grantedAccessMessage: { title: string; description: string };
  isRetry: boolean;
  attemptsRemaining: number;
  maxPasscodeAttempt: number;
  promptModalName: string;
  modalRef: React.RefObject<BottomSheetModalMethods>;
  onModalCancel: () => void;
  additionalMessage?: string;
  additionalMessageUrl?: string;
  successMessage?: string;
}

// Todo(suraj) Remove code duplication and figure out a way to add focus to PinInput

const PromptContent = React.memo((props: PasscodePromptProps): JSX.Element => {
  return (
    <>
      <ThemedTouchableOpacityV2
        light={tailwind("bg-mono-light-v2-100")}
        dark={tailwind("bg-mono-dark-v2-100")}
        onPress={() => props.onCancel(USER_CANCELED)}
        style={tailwind("items-end pt-5 px-5 rounded-t-xl-v2")}
        testID="cancel_authorization"
        disabled={[TransactionStatus.BLOCK, TransactionStatus.SIGNING].includes(
          props.status
        )}
      >
        <ThemedIcon
          dark={tailwind("text-mono-dark-v2-900")}
          light={tailwind("text-mono-light-v2-900")}
          iconType="Feather"
          name="x-circle"
          size={20}
        />
      </ThemedTouchableOpacityV2>
      <ThemedViewV2 style={tailwind("w-full flex-1 flex-col px-5")}>
        <ThemedTextV2
          style={tailwind("text-center font-normal-v2 pt-1.5 px-10", {
            "mb-16 pb-3": props.status === TransactionStatus.PIN,
          })}
          testID="txn_authorization_title"
        >
          {props.transaction?.title ?? props.title}
        </ThemedTextV2>
        {props.status === TransactionStatus.SIGNING && (
          <>
            <ThemedActivityIndicatorV2
              style={[tailwind("py-2 my-5"), { transform: [{ scale: 1.5 }] }]}
            />
            <ReadOnlyPinInput pinLength={props.pinLength} pin={props.pin} />
          </>
        )}
        {props.status === TransactionStatus.AUTHORIZED && (
          <>
            <SuccessIndicator />
            <ReadOnlyPinInput pinLength={props.pinLength} pin={props.pin} />
          </>
        )}
        {props.status === TransactionStatus.PIN && (
          <PinTextInputV2
            cellCount={props.pinLength}
            onChange={(pin) => {
              props.onPinInput(pin);
            }}
            testID="pin_authorize"
            value={props.pin}
          />
        )}
        <View style={tailwind("text-sm text-center mb-14 mt-4 px-10")}>
          {([TransactionStatus.SIGNING, TransactionStatus.AUTHORIZED].includes(
            props.status
          ) ||
            (props.status === TransactionStatus.PIN && !props.isRetry)) && (
            <ThemedTextV2
              testID="txn_authorization_message"
              dark={tailwind("text-mono-dark-v2-700")}
              light={tailwind("text-mono-light-v2-700")}
              style={tailwind("text-sm text-center font-normal-v2")}
            >
              {props.status === TransactionStatus.SIGNING &&
                translate("screens/UnlockWallet", props.loadingMessage)}
              {props.status === TransactionStatus.AUTHORIZED &&
                props.successMessage}
              {props.status === TransactionStatus.PIN &&
                translate("screens/UnlockWallet", props.message)}
            </ThemedTextV2>
          )}

          {
            // hide description when passcode is incorrect or verified.
            props.status !== TransactionStatus.AUTHORIZED &&
              !props.isRetry &&
              props.transaction?.description !== undefined && (
                <ThemedTextV2
                  testID="txn_authorization_description"
                  dark={tailwind("text-mono-dark-v2-700")}
                  light={tailwind("text-mono-light-v2-700")}
                  style={tailwind("text-sm text-center font-normal-v2")}
                >
                  {props.transaction.description}
                </ThemedTextV2>
              )
          }
          {
            // show remaining attempt allowed
            props.status !== TransactionStatus.SIGNING &&
              props.attemptsRemaining !== undefined &&
              props.attemptsRemaining !== props.maxPasscodeAttempt && (
                <ThemedTextV2
                  style={tailwind("text-center text-sm font-normal-v2")}
                  light={tailwind("text-red-v2")}
                  dark={tailwind("text-red-v2")}
                  testID="pin_attempt_error"
                >
                  {translate(
                    "screens/PinConfirmation",
                    `${
                      props.attemptsRemaining === 1
                        ? "Last attempt or your wallet will be unlinked for your security"
                        : props.isRetry
                        ? "Incorrect passcode.\n{{attemptsRemaining}} attempts remaining"
                        : "{{attemptsRemaining}} attempts remaining"
                    }`,
                    { attemptsRemaining: props.attemptsRemaining }
                  )}
                </ThemedTextV2>
              )
          }
        </View>
      </ThemedViewV2>
    </>
  );
});

export const PasscodePrompt = React.memo(
  (props: PasscodePromptProps): JSX.Element => {
    const containerRef = React.useRef(null);
    const getSnapPoints = (): string[] => {
      if (Platform.OS === "ios") {
        return ["70%"]; // ios measures space without keyboard
      } else if (Platform.OS === "android") {
        return ["55%"]; // android measure space by including keyboard
      }
      return [];
    };

    if (Platform.OS === "web") {
      return (
        <SafeAreaView
          style={tailwind("w-full h-full flex-col absolute z-50 top-0 left-0")}
          ref={containerRef}
        >
          <Modal
            container={containerRef}
            show
            renderBackdrop={() => (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  backgroundColor: "black",
                  opacity: 0.6,
                }}
              />
            )}
            style={{
              position: "absolute",
              height: "450px",
              width: "375px",
              zIndex: 50,
              bottom: "0",
            }} // array as value crashes Web Modal
          >
            <View style={tailwind("w-full h-full")}>
              <PromptContent {...props} />
            </View>
          </Modal>
        </SafeAreaView>
      );
    }

    return (
      <BottomSheetModal
        name={props.promptModalName}
        ref={props.modalRef}
        snapPoints={getSnapPoints()}
        handleComponent={EmptyHandleComponent}
        backdropComponent={(backdropProps: BottomSheetBackdropProps) => (
          <View
            {...backdropProps}
            style={[backdropProps.style, tailwind("bg-black bg-opacity-60")]}
          />
        )}
        backgroundComponent={(backgroundProps: BottomSheetBackgroundProps) => (
          <ThemedViewV2
            {...backgroundProps}
            style={[backgroundProps.style, tailwind("rounded-t-xl-v2")]}
          />
        )}
        onChange={(index) => {
          if (index === -1) {
            props.onModalCancel();
          }
        }}
        enablePanDownToClose={false}
      >
        <SafeAreaView
          style={tailwind("w-full h-full flex-col absolute z-50 top-0 left-0")}
        >
          <PromptContent {...props} />
        </SafeAreaView>
      </BottomSheetModal>
    );
  }
);

function EmptyHandleComponent(): JSX.Element {
  return <View />;
}

function SuccessIndicator(): JSX.Element {
  return (
    <View style={tailwind("flex flex-col items-center py-4.5 mb-0.5")}>
      <ThemedIcon
        size={38}
        name="check-circle"
        iconType="MaterialIcons"
        light={tailwind("text-green-v2")}
        dark={tailwind("text-green-v2")}
        testID="passcode_success_indicator"
      />
    </View>
  );
}

function ReadOnlyPinInput({
  pinLength,
  pin,
}: {
  pinLength: number;
  pin: string;
}): JSX.Element {
  return (
    <PinTextInputV2
      cellCount={pinLength}
      onChange={() => {}}
      testID="pin_authorize"
      value={pin}
      autofocus={false} // to hide keyboard input on android
    />
  );
}
