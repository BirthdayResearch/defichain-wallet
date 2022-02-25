import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { LoanScheme, LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useCollateralizationRatioColor } from '../hooks/CollateralizationRatio'
import { View } from '@components'
import { VaultSectionTextRow } from '../components/VaultSectionTextRow'
import { StackScreenProps } from '@react-navigation/stack'
import { LoanParamList } from '../LoansNavigator'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { LoanSchemeOptions, WalletLoanScheme } from '../components/LoanSchemeOptions'
import { ascColRatioLoanScheme } from '@store/loans'
import { Button } from '@components/Button'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useVaultStatus, VaultStatusTag } from '../components/VaultStatusTag'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'

type Props = StackScreenProps<LoanParamList, 'EditLoanSchemeScreen'>

export function EditLoanSchemeScreen ({ route, navigation }: Props): JSX.Element {
  const { vaultId } = route.params
  const { vaults } = useSelector((state: RootState) => state.loans)
  const loanSchemes = useSelector((state: RootState) => ascColRatioLoanScheme(state.loans))
  const [activeVault, setActiveVault] = useState<LoanVaultActive>()
  const [filteredLoanSchemes, setFilteredLoanSchemes] = useState<WalletLoanScheme[]>()
  const [selectedLoanScheme, setSelectedLoanScheme] = useState<LoanScheme>()
  const logger = useLogger()
  const client = useWhaleApiClient()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))

  // Continue button
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const onSubmit = (): void => {
    if (selectedLoanScheme === undefined || activeVault === undefined || hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    navigation.navigate({
      name: 'ConfirmEditLoanSchemeScreen',
      params: {
        vault: activeVault,
        loanScheme: selectedLoanScheme,
        fee: fee
      }
    })
  }

  useEffect(() => {
    const v = vaults.find((v) => v.vaultId === vaultId) as LoanVaultActive
    if (v === undefined) {
      return
    }
    setActiveVault(v)

    const l = loanSchemes.find(l => l.id === v.loanScheme.id)
    if (l === undefined || selectedLoanScheme !== undefined) {
      return
    }

    setSelectedLoanScheme(l)
  }, [vaults, loanSchemes])

  useEffect(() => {
    setFilteredLoanSchemes(loanSchemes.map(scheme => {
      const loanscheme: WalletLoanScheme = {
        disabled: new BigNumber(activeVault?.collateralRatio ?? NaN).isGreaterThan(0) && new BigNumber(activeVault?.collateralRatio ?? NaN).isLessThan(scheme.minColRatio),
        ...scheme
      }
      return loanscheme
    }))
  }, [activeVault])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  if (activeVault === undefined || filteredLoanSchemes === undefined) {
    return <></>
  }

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('px-4 pt-0 pb-8')}
    >
      <ThemedSectionTitle
        style={tailwind('text-xs pb-2 pt-4 font-medium')}
        text={translate('screens/EditLoanSchemeScreen', 'EDIT LOAN SCHEME OF VAULT')}
      />
      <VaultSection vault={activeVault} />
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-500')}
        style={tailwind('text-xs mb-6')}
      >
        {translate('screens/EditLoanSchemeScreen', 'Make sure your collateralization ratio is still above your min. collateralization ratio')}
      </ThemedText>
      <LoanSchemeOptions
        loanSchemes={filteredLoanSchemes}
        selectedLoanScheme={selectedLoanScheme}
        onLoanSchemePress={(scheme: LoanScheme) => setSelectedLoanScheme(scheme)}
      />
      <Button
        disabled={selectedLoanScheme === undefined || selectedLoanScheme.id === activeVault.loanScheme.id || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/EditLoanSchemeScreen', 'CONTINUE')}
        onPress={onSubmit}
        margin='mt-7 mb-2'
        testID='edit_loan_scheme_submit_button'
      />
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-center text-xs')}
      >
        {translate('screens/EditLoanSchemeScreen', 'Confirm your vault details in next screen')}
      </ThemedText>
    </ThemedScrollView>
  )
}

function VaultSection (props: { vault: LoanVaultActive }): JSX.Element {
  const { vault } = props
  const colRatio = new BigNumber(vault.collateralRatio)
  const minColRatio = new BigNumber(vault.loanScheme.minColRatio)
  const totalLoanValue = new BigNumber(vault.loanValue)
  const totalCollateralValue = new BigNumber(vault.collateralValue)
  const vaultState = useVaultStatus(vault.state, colRatio, minColRatio, totalLoanValue, totalCollateralValue)
  const colors = useCollateralizationRatioColor({
    colRatio,
    minColRatio,
    totalLoanAmount: totalLoanValue,
    totalCollateralValue
  })
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border rounded px-4 py-3 mb-2')}
    >
      <View style={tailwind('mb-2 flex flex-row')}>
        <View style={tailwind('flex-1 mr-5')}>
          <ThemedText
            style={tailwind('font-medium')}
            numberOfLines={1}
            ellipsizeMode='middle'
          >
            {vault.vaultId}
          </ThemedText>
        </View>
        <VaultStatusTag status={vaultState.status} />
      </View>
      <VaultSectionTextRow
        testID='text_total_collateral_value'
        value={getUSDPrecisedPrice(vault.collateralValue ?? 0)}
        prefix='$'
        lhs={translate('screens/EditCollateralScreen', 'Total collateral (USD)')}
      />
      <VaultSectionTextRow
        testID='text_total_collateral_value'
        value={getUSDPrecisedPrice(vault.loanValue ?? 0)}
        prefix='$'
        lhs={translate('screens/EditCollateralScreen', 'Total loans (USD)')}
      />
      <VaultSectionTextRow
        testID='text_total_collateral_value'
        value={new BigNumber(vault.collateralRatio === '-1' ? NaN : vault.collateralRatio).toFixed(2)}
        suffix={vault.collateralRatio === '-1' ? translate('screens/EditCollateralScreen', 'N/A') : '%'}
        suffixType='text'
        lhs={translate('screens/EditCollateralScreen', 'Collateralization ratio')}
        rhsThemedProps={colors}
        info={{
          title: 'Collateralization ratio',
          message: 'The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.'
        }}
      />
      <VaultSectionTextRow
        testID='text_total_collateral_value'
        value={new BigNumber(vault.loanScheme.minColRatio ?? 0).toFixed(2)} suffix='%'
        suffixType='text'
        lhs={translate('screens/EditCollateralScreen', 'Min. collateralization ratio')}
        info={{
          title: 'Min. collateralization ratio',
          message: 'Minimum required collateralization ratio based on loan scheme selected. A vault will go into liquidation when the collateralization ratio goes below the minimum requirement.'
        }}
      />
    </ThemedView>
  )
}
