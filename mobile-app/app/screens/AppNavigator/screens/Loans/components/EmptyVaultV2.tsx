import { Image, Platform, RefreshControl } from "react-native";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { InfoTextLinkV2 } from "@components/InfoTextLink";
import { View } from "@components";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ButtonV2 } from "@components/ButtonV2";
import EmptyVault from "@assets/images/loans/empty_vault.png";
import {
  BottomSheetNavScreen,
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { useState } from "react";
import { LoansCarousel } from "@screens/WalletNavigator/screens/components/LoansCarousel";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { LoanParamList } from "../LoansNavigator";

interface EmptyVaultProps {
  handleRefresh: (nextToken?: string | undefined) => void;
  isLoading: boolean;
}

export function EmptyVaultV2(props: EmptyVaultProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const { isLight } = useThemeContext();
  const [bottomSheetScreen, setBottomSheetScreen] = useState<
    BottomSheetNavScreen[]
  >([]);

  const {
    bottomSheetRef,
    containerRef,
    dismissModal,
    expandModal,
    isModalDisplayed,
  } = useBottomSheet();

  const BottomSheetHeader = {
    headerStatusBarHeight: 2,
    headerTitle: "",
    headerBackTitleVisible: false,
    headerStyle: tailwind("rounded-t-xl-v2 border-b-0", {
      "bg-mono-light-v2-100": isLight,
      "bg-mono-dark-v2-100": !isLight,
    }),
    headerRight: (): JSX.Element => {
      return (
        <ThemedTouchableOpacityV2
          style={tailwind("mr-5 mt-4 -mb-4")}
          onPress={dismissModal}
          testID="close_bottom_sheet_button"
        >
          <ThemedIcon iconType="Feather" name="x-circle" size={22} />
        </ThemedTouchableOpacityV2>
      );
    },
    headerLeft: () => <></>,
  };
  const onBottomSheetLoansInfoSelect = (): void => {
    setBottomSheetScreen([
      {
        stackScreenName: "LoansCarousel",
        component: () => <LoansCarousel dismissModal={dismissModal} />,
        option: BottomSheetHeader,
      },
    ]);
    expandModal();
  };
  return (
    <ThemedScrollViewV2
      refreshControl={
        <RefreshControl
          onRefresh={props.handleRefresh}
          refreshing={props.isLoading}
        />
      }
      contentContainerStyle={tailwind("px-8 pt-6 pb-2")}
      testID="empty_vault"
      ref={containerRef}
    >
      <View style={tailwind("pb-8 items-center")}>
        <Image source={EmptyVault} style={{ width: 204, height: 136 }} />
      </View>

      <ThemedTextV2
        style={tailwind("text-xl pb-2 font-semibold-v2 text-center")}
        testID="empty_vault_title"
      >
        {translate("components/EmptyVault", "No vaults")}
      </ThemedTextV2>

      <ThemedTextV2
        style={tailwind("text-center font-normal-v2 px-4")}
        testID="empty_vault_description"
      >
        {translate(
          "components/EmptyVault",
          "Get started with loans. Create a vault for your collaterals."
        )}
      </ThemedTextV2>

      <ButtonV2
        label={translate("components/EmptyVault", "Create a vault")}
        onPress={() =>
          navigation.navigate({
            name: "CreateVaultScreen",
            params: {},
            merge: true,
          })
        }
        testID="button_create_vault"
      />
      <View style={tailwind("items-center pt-2")}>
        <InfoTextLinkV2
          onPress={onBottomSheetLoansInfoSelect}
          text="Learn more"
          testId="empty_vault_learn_more"
          textStyle={tailwind("text-sm")}
        />
      </View>

      {Platform.OS === "web" && (
        <BottomSheetWebWithNavV2
          modalRef={containerRef}
          screenList={bottomSheetScreen}
          isModalDisplayed={isModalDisplayed}
          // eslint-disable-next-line react-native/no-inline-styles
          modalStyle={{
            position: "absolute",
            bottom: "0",
            height: "454px",
            width: "375px",
            zIndex: 50,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            overflow: "hidden",
          }}
        />
      )}

      {Platform.OS !== "web" && (
        <BottomSheetWithNavV2
          modalRef={bottomSheetRef}
          screenList={bottomSheetScreen}
          snapPoints={{
            ios: ["60%"],
            android: ["75%"],
          }}
        />
      )}
    </ThemedScrollViewV2>
  );
}
