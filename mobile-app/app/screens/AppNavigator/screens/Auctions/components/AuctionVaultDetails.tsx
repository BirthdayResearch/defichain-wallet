import { tailwind } from "@tailwind";
import { TextRowV2 } from "@components/TextRowV2";
import { translate } from "@translations";
import { NumberRowV2 } from "@components/NumberRowV2";
import { useDeFiScanContext } from "@shared-contexts/DeFiScanContext";
import { LoanVaultLiquidated } from "@defichain/whale-api-client/dist/api/loan";
import { View } from "@components";

interface AuctionVaultDetailsProps {
  vault: LoanVaultLiquidated;
  testID: string;
  showLinkToVault?: boolean;
}

export function AuctionVaultDetails({
  vault,
  testID,
  showLinkToVault,
}: AuctionVaultDetailsProps): JSX.Element {
  const { getVaultsUrl, getAddressUrl } = useDeFiScanContext();

  const containerThemeOptions = {
    light: tailwind("bg-transparent border-mono-light-v2-300"),
    dark: tailwind("bg-transparent border-mono-dark-v2-300"),
  };
  const lhsThemedProps = {
    light: tailwind("text-mono-light-v2-500"),
    dark: tailwind("text-mono-dark-v2-500"),
  };
  const rhsThemedProps = {
    light: tailwind("text-mono-light-v2-900"),
    dark: tailwind("text-mono-dark-v2-900"),
  };

  return (
    <View testID={testID}>
      <TextRowV2
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent mt-6"),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate("screens/ConfirmPlaceBidScreen", "Vault ID"),
          testID: `${testID}_vault_id_label`,
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: vault.vaultId,
          testID: `${testID}_vault_id`,
          numberOfLines: 1,
          ellipsizeMode: "middle",
          themedProps: rhsThemedProps,
          openNewBrowserLink: showLinkToVault
            ? getVaultsUrl(vault.vaultId)
            : undefined,
        }}
      />
      <TextRowV2
        containerStyle={{
          style: tailwind("flex-row items-start w-full bg-transparent mt-6"),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate("screens/ConfirmPlaceBidScreen", "Vault owner ID"),
          testID: `${testID}_vault_owner_label`,
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: vault.ownerAddress,
          testID: `${testID}_vault_owner_id`,
          numberOfLines: 1,
          ellipsizeMode: "middle",
          themedProps: rhsThemedProps,
          openNewBrowserLink: showLinkToVault
            ? getAddressUrl(vault.ownerAddress)
            : undefined,
        }}
      />
      <NumberRowV2
        containerStyle={{
          style: tailwind(
            "flex-row items-start w-full bg-transparent border-b-0.5 pb-5 mt-6"
          ),
          ...containerThemeOptions,
        }}
        lhs={{
          value: translate(
            "screens/ConfirmPlaceBidScreen",
            "Liquidation height"
          ),
          testID: `${testID}_liquidation_height_label`,
          themedProps: lhsThemedProps,
        }}
        rhs={{
          value: vault.liquidationHeight,
          testID: `${testID}_liquidation_height`,
          themedProps: rhsThemedProps,
        }}
      />
    </View>
  );
}
