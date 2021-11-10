import { FeeInfoRow } from '@components/FeeInfoRow'
import { NumberRow } from '@components/NumberRow'
import { TextRow } from '@components/TextRow'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import BigNumber from 'bignumber.js'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React from 'react'
import { View } from 'react-native'
import { LoanParamList } from '../LoansNavigator'
import { SymbolIcon } from '@components/SymbolIcon'
import NumberFormat from 'react-number-format'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'

type Props = StackScreenProps<LoanParamList, 'ConfirmAddCollateralScreen'>

export function ConfirmAddCollateralScreen ({ route, navigation }: Props): JSX.Element {
  const {
    vaultId,
    collaterals,
    totalCollateralValue,
    fee
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))

  function onCancel (): void {
    navigation.navigate({
      name: 'AddCollateralScreen',
      params: {
        vaultId
      },
      merge: true
    })
  }

  async function onSubmit (): Promise<void> {
    // TODO: create signer to add collateral, remove custom navigation below
    navigation.navigate({
      name: 'VaultDetailScreen',
      params: {
        vaultId: vaultId,
        emptyActiveLoans: false
      },
      merge: true
    })
  }

  function getSubmitLabel (): string {
    if (hasPendingBroadcastJob || hasPendingJob) {
      return 'CREATING'
    }
    return 'CONFIRM ADD COLLATERAL'
  }

  return (
    <ThemedScrollView>
      <SummaryHeader vaultId={vaultId} />
      <SummaryTransactionDetails
        tokensToAdd={collaterals.length}
        totalCollateralValue={totalCollateralValue}
        fee={fee}
      />
      {collaterals.map((collateral, index) =>
        (
          <CollateralSection
            key={collateral.collateralId}
            index={index}
            collateralId={collateral.collateralId}
            collateralAmount={collateral.amount}
            collateralValue={collateral.amountValue}
            collateralizationFactor={collateral.collateralFactor}
            vaultProportion={collateral.vaultProportion}
          />
        ))}
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmAddCollateralScreen', 'CONFIRM ADD COLLATERAL')}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmAddCollateralScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='create_vault'
      />
    </ThemedScrollView>
  )
}

function SummaryHeader (props: {vaultId: string}): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-300')}
      style={tailwind('flex-col px-4 py-6')}
    >
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('mb-2')}
      >
        {translate('screens/ConfirmAddCollateralScreen', 'You are adding collaterals to')}
      </ThemedText>
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedView
          light={tailwind('bg-gray-100')}
          dark={tailwind('bg-gray-700')}
          style={tailwind('w-8 h-8 rounded-full flex items-center justify-center mr-2')}
        >
          <ThemedIcon
            iconType='MaterialIcons'
            name='shield'
            size={14}
            light={tailwind('text-gray-600')}
            dark={tailwind('text-gray-300')}
          />
        </ThemedView>
        <ThemedText
          light={tailwind('text-gray-900')}
          dark={tailwind('text-gray-50')}
          style={tailwind('text-sm font-medium flex-1 w-8/12')}
        >
          {props.vaultId}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

function SummaryTransactionDetails (props: {tokensToAdd: number, totalCollateralValue: BigNumber, fee: BigNumber}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmAddCollateralScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmAddCollateralScreen', 'Transaction type')}
        rhs={{
          value: translate('screens/ConfirmAddCollateralScreen', 'Add collateral'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmCreateVaultScreen', 'Collateral tokens to add')}
        rhs={{
          value: props.tokensToAdd,
          testID: 'tokens_to_add',
          suffixType: 'text'
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmCreateVaultScreen', 'Total collateral value (USD)')}
        rhs={{
          value: props.totalCollateralValue.toFixed(2),
          testID: 'total_collateral_value',
          suffixType: 'text',
          prefix: '$'
        }}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={props.fee.toFixed(8)}
        testID='estimated_fee'
        suffix='DFI'
      />
    </>
  )
}

interface CollateralSectionProps {
  index: number
  collateralId: string
  collateralizationFactor: BigNumber
  collateralAmount: BigNumber
  collateralValue: BigNumber
  vaultProportion: BigNumber
}

function CollateralSection (props: CollateralSectionProps): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmAddCollateralScreen', 'COLLATERAL {{index}}', { index: props.index + 1 })}
      />
      <TextRow
        lhs={translate('screens/ConfirmAddCollateralScreen', 'Token')}
        rhs={{
          value: props.collateralId,
          testID: 'text_token_id'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddCollateralScreen', 'Collateralization factor')}
        rhs={{
          value: new BigNumber(props.collateralizationFactor).toFixed(2),
          testID: 'collateral_factor',
          suffixType: 'text',
          suffix: '%'
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddCollateralScreen', 'Collateral amount')}
        rhs={{
          value: new BigNumber(props.collateralAmount).toFixed(8),
          testID: 'collateral_amount',
          suffixType: 'text',
          suffix: ` ${props.collateralId}`
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddCollateralScreen', 'Collateral value (USD)')}
        rhs={{
          value: new BigNumber(props.collateralAmount).toFixed(2),
          testID: 'collateral_value',
          prefix: '$'
        }}
      />
      <VaultProportionRow
        lhs={translate('screens/ConfirmAddCollateralScreen', 'Vault %')}
        tokenId={props.collateralId}
        proportion={props.vaultProportion}
      />
    </>
  )
}

function VaultProportionRow (props: {lhs: string, tokenId: string, proportion: BigNumber}): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full justify-between')}
    >
      <View style={tailwind('w-5/12')}>
        <ThemedText style={tailwind('text-sm')}>
          {props.lhs}
        </ThemedText>
      </View>

      <ThemedView
        light={tailwind('bg-gray-50')}
        dark={tailwind('bg-gray-900')}
        style={tailwind('flex flex-row py-1 px-1.5 rounded-2xl')}
      >
        <SymbolIcon symbol={props.tokenId} />
        <NumberFormat
          value={props.proportion.toFixed(2)}
          decimalScale={2}
          displayType='text'
          suffix='%'
          renderText={value =>
            <ThemedText
              light={tailwind('text-gray-700')}
              dark={tailwind('text-gray-300')}
              style={tailwind('text-xs font-medium ml-1')}
            >
              {value}
            </ThemedText>}
        />
      </ThemedView>
    </ThemedView>
  )
}
