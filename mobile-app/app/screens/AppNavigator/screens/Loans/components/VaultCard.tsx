
import BigNumber from 'bignumber.js'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { translate } from '@translations'
import { TokenIconGroup } from '@components/TokenIconGroup'
import { IconButton } from '@components/IconButton'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { LoanParamList } from '@screens/AppNavigator/screens/Loans/LoansNavigator'
import { LoanVault } from '@store/loans'
import { LoanVaultActive, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { VaultInfo } from '@screens/AppNavigator/screens/Loans/components/VaultInfo'
import { TouchableOpacity } from 'react-native'
import { openURL } from '@api/linking'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { VaultSectionTextRow } from '@screens/AppNavigator/screens/Loans/components/VaultSectionTextRow'
import {
  useVaultStatus,
  VaultStatusTag
} from '@screens/AppNavigator/screens/Loans/components/VaultStatusTag'
import { useNextCollateralizationRatio } from '@screens/AppNavigator/screens/Loans/hooks/NextCollateralizationRatio'
import {
  CollateralizationRatioDisplay
} from '@screens/AppNavigator/screens/Loans/components/CollateralizationRatioDisplay'
import { TabKey } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/VaultDetailTabSection'
import { useLoanOperations } from '@screens/AppNavigator/screens/Loans/hooks/LoanOperations'
import { VaultStatus } from '@screens/AppNavigator/screens/Loans/VaultStatusTypes'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'

export interface VaultCardProps extends React.ComponentProps<any> {
  vault: LoanVault
  testID: string
}

export function VaultCard (props: VaultCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  const vault = props.vault as LoanVaultActive
  const { getVaultsUrl } = useDeFiScanContext()
  const vaultState = useVaultStatus(vault.state, new BigNumber(vault.collateralRatio), new BigNumber(vault.loanScheme.minColRatio), new BigNumber(vault.loanValue), new BigNumber(vault.collateralValue))
  const nextCollateralizationRatio = useNextCollateralizationRatio(vault.collateralAmounts, vault.loanAmounts)
  const canUseOperations = useLoanOperations(vault?.state)
  const onCardPress = (): void => {
    navigation.navigate('VaultDetailScreen', {
      vaultId: vault.vaultId
    })
  }
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('rounded mb-2 border p-4')}
    >
      <ThemedTouchableOpacity
        testID={props.testID}
        onPress={onCardPress}
        style={tailwind('mb-2')}
        light={tailwind('border-b-0')}
        dark={tailwind('border-b-0')}
      >
        <View style={tailwind('flex flex-row justify-between mb-4')}>
          <View style={tailwind('flex flex-row flex-1 items-center')}>
            <View style={tailwind('flex flex-col flex-1')}>
              <View style={tailwind('flex flex-row justify-between items-center')}>
                <View style={tailwind('flex-col')}>
                  <View style={tailwind('flex-row items-center')}>
                    <ThemedText
                      light={tailwind('text-gray-400')}
                      dark={tailwind('text-gray-500')}
                      style={tailwind('text-xs mr-1.5')}
                    >
                      {translate('screens/VaultDetailScreen', 'Vault ID')}
                    </ThemedText>
                    <VaultStatusTag status={vaultState.status} testID={`${props.testID}_status`} />
                  </View>
                  <TouchableOpacity
                    style={tailwind('flex flex-row mb-0.5 items-center')}
                    onPress={async () => await openURL(getVaultsUrl(vault.vaultId))}
                  >
                    <ThemedText
                      testID={`${props.testID}_vault_id`}
                      style={tailwind('font-semibold w-56 flex-shrink mr-0.5')}
                      numberOfLines={1}
                      ellipsizeMode='middle'
                    >
                      {vault.vaultId}
                    </ThemedText>
                    <ThemedIcon
                      dark={tailwind('text-darkprimary-500')}
                      iconType='MaterialIcons'
                      light={tailwind('text-primary-500')}
                      name='open-in-new'
                      size={18}
                    />
                  </TouchableOpacity>
                </View>
                {
                  canUseOperations && (
                    <ThemedIcon
                      dark={tailwind('text-gray-200')}
                      iconType='MaterialIcons'
                      light={tailwind('text-black')}
                      name='chevron-right'
                      size={30}
                    />
                  )
                }
              </View>
              <View style={tailwind('flex flex-row')}>
                <ThemedText
                  light={tailwind('text-gray-500')}
                  dark={tailwind('text-gray-300')}
                  style={tailwind('text-xs mr-1')}
                >
                  {translate('components/VaultCard', 'Collateral:')}
                </ThemedText>
                {
                  (vault.collateralAmounts?.length === 0 || vault.collateralAmounts === undefined) &&
                  (
                    <ThemedText
                      light={tailwind('text-gray-500')}
                      dark={tailwind('text-gray-300')}
                      style={tailwind('text-xs ml-1')}
                      testID={`${props.testID}_collateral_none`}
                    >
                      {translate('components/VaultCard', 'None')}
                    </ThemedText>
                  )
                }
                <TokenIconGroup
                  testID={`${props.testID}_collateral_token_group`}
                  symbols={vault.collateralAmounts?.map(collateral => collateral.displaySymbol)}
                  maxIconToDisplay={3}
                />
              </View>
            </View>
          </View>
        </View>
        {
          ![VaultStatus.Empty, VaultStatus.Ready, VaultStatus.Unknown, VaultStatus.Liquidated].includes(vaultState.status) && (
            <CollateralizationRatioDisplay
              testID={props.testID}
              collateralizationRatio={vault.collateralRatio}
              minCollateralizationRatio={vault.loanScheme.minColRatio}
              totalLoanAmount={vault.loanValue}
              nextCollateralizationRatio={nextCollateralizationRatio?.toFixed(8)}
            />
          )
        }
        <View style={tailwind('flex flex-row flex-wrap -mb-2')}>
          {
            vault.loanAmounts?.length > 0 &&
            (
              <VaultInfo
                label='Active loans' testID={props.testID} tokens={vault.loanAmounts?.map(loan => loan.displaySymbol)}
              />
            )
          }
          <VaultSectionTextRow
            testID={`${props.testID}_total_loan`}
            prefix={VaultStatus.Liquidated === vaultState.status ? '' : '$'}
            value={VaultStatus.Liquidated === vaultState.status ? '-' : getUSDPrecisedPrice(vault.loanValue) ?? '-'}
            lhs={translate('components/VaultCard', 'Total loans (USD)')}
          />
          <VaultSectionTextRow
            testID={`${props.testID}_total_collateral`}
            prefix={VaultStatus.Liquidated === vaultState.status ? '' : '$'}
            value={VaultStatus.Liquidated === vaultState.status ? '-' : getUSDPrecisedPrice(vault.collateralValue)}
            lhs={translate('components/VaultCard', 'Total collateral (USD)')}
          />
        </View>
      </ThemedTouchableOpacity>
      <VaultActionButton vault={vault} canUseOperation={canUseOperations} testID={props.testID} />
    </ThemedView>
  )
}

function VaultActionButton ({
  vault,
  canUseOperation,
  testID
}: { vault: LoanVaultActive, canUseOperation: boolean, testID: string }): JSX.Element | null {
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  return (
    <ThemedView
      light={tailwind('border-gray-200')}
      dark={tailwind('border-gray-700')}
      style={tailwind('flex flex-row mt-4 items-center flex-wrap -mb-2')}
    >
      {
        new BigNumber(vault.collateralValue).gt(0) && (
          <IconButton
            testID={`${testID}_manage_loans_button`}
            disabled={!canUseOperation || vault.state === LoanVaultState.FROZEN}
            iconLabel={translate('components/VaultCard', 'MANAGE LOANS')}
            style={tailwind('mr-2 mb-2 items-center')}
            onPress={() => {
              navigation.navigate('VaultDetailScreen', {
                vaultId: vault.vaultId,
                tab: TabKey.Loans
              })
            }}
          />
        )
      }
      <IconButton
        testID={`${testID}_edit_collaterals_button`}
        disabled={!canUseOperation}
        iconLabel={translate('components/VaultCard', 'EDIT COLLATERAL')}
        style={tailwind('mr-2 mb-2 items-center')}
        onPress={() => {
          navigation.navigate({
            name: 'EditCollateralScreen',
            params: {
              vaultId: vault.vaultId
            },
            merge: true
          })
        }}
      />
    </ThemedView>
  )
}
