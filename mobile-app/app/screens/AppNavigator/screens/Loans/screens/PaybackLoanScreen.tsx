import React, { useEffect, useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { LoanParamList } from '@screens/AppNavigator/screens/Loans/LoansNavigator'
import { View } from 'react-native'
import {
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedView
} from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { SymbolIcon } from '@components/SymbolIcon'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
import { LoanToken, LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { useVaultStatus, VaultStatusTag } from '@screens/AppNavigator/screens/Loans/components/VaultStatusTag'
import { useCollateralizationRatioColor } from '@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio'
import { WalletTextInput } from '@components/WalletTextInput'
import { InputHelperText } from '@components/InputHelperText'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { Button } from '@components/Button'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { NumberRow } from '@components/NumberRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLoanOperations } from '@screens/AppNavigator/screens/Loans/hooks/LoanOperations'
import { BottomSheetInfo } from '@components/BottomSheetInfo'
import { useMaxLoanAmount } from '../hooks/MaxLoanAmount'

type Props = StackScreenProps<LoanParamList, 'PaybackLoanScreen'>

export function PaybackLoanScreen ({
  navigation,
  route
}: Props): JSX.Element {
  const {
    loanToken,
    vault
  } = route.params
  const tokens = useTokensAPI()
  const getTokenAmount = (tokenId: string): BigNumber => {
    const id = tokenId === '0' ? '0_unified' : tokenId
    return new BigNumber(tokens.find((t) => t.id === id)?.amount ?? 0)
  }

  const canUseOperations = useLoanOperations(vault?.state)
  const client = useWhaleApiClient()
  const token = tokens?.find((t) => t.id === loanToken.id)
  const tokenBalance = (token != null) ? getTokenAmount(token.id) : 0
  const [amountToPay, setAmountToPay] = useState(loanToken.amount)
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [isValid, setIsValid] = useState(false)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const logger = useLogger()

  const isFormValid = (): boolean => {
    const amount = new BigNumber(amountToPay)
    return !(amount.isNaN() ||
      amount.isLessThanOrEqualTo(0) || amount.gt(tokenBalance) || amount.gt(loanToken.amount))
  }

  useEffect(() => {
    const isValid = isFormValid()
    setIsValid(isValid)
  }, [amountToPay])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  const onSubmit = async (): Promise<void> => {
    if (!isValid || vault === undefined || hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    navigation.navigate({
      name: 'ConfirmPaybackLoanScreen',
      params: {
        vault,
        amountToPay: new BigNumber(amountToPay),
        fee,
        loanToken
      },
      merge: true
    })
  }

  return (
    <ThemedScrollView contentContainerStyle={tailwind('pb-8 pt-2')}>
      <ThemedSectionTitle
        text={translate('screens/PaybackLoanScreen', 'YOU ARE PAYING FOR LOAN')}
      />
      <View style={tailwind('px-4')}>
        <LoanTokenInput
          loanTokenId={loanToken.id}
          displaySymbol={loanToken.displaySymbol}
          price={loanToken.activePrice}
          outstandingBalance={new BigNumber(loanToken.amount)}
        />
      </View>
      <ThemedSectionTitle
        text={translate('screens/PaybackLoanScreen', 'VAULT IN USE')}
      />
      <View style={tailwind('px-4')}>
        <VaultInput vault={vault} />
      </View>
      <View style={tailwind('my-2 px-4')}>
        <WalletTextInput
          inputType='numeric'
          value={amountToPay}
          title={translate('screens/PaybackLoanScreen', 'How much do you want to pay?')}
          placeholder={translate('screens/PaybackLoanScreen', 'Enter an amount')}
          onChangeText={(text) => setAmountToPay(text)}
          displayClearButton={amountToPay !== ''}
          onClearButtonPress={() => setAmountToPay('')}
          style={tailwind('h-9 w-3/5 flex-grow')}
        />
        <InputHelperText
          label={`${translate('screens/PaybackLoanScreen', 'Available')}: `}
          content={new BigNumber(tokenBalance).toFixed(8)}
          suffix={` ${loanToken.displaySymbol}`}
          styleProps={tailwind('font-medium')}
        />
      </View>
      {
        isValid && (
          <View>
            <TransactionDetailsSection
              fee={fee} outstandingBalance={new BigNumber(loanToken.amount)}
              amountToPay={new BigNumber(amountToPay)}
              displaySymbol={loanToken.displaySymbol}
            />
          </View>
        )
      }
      <Button
        disabled={!isValid || hasPendingJob || hasPendingBroadcastJob || !canUseOperations}
        label={translate('screens/PaybackLoanScreen', 'CONTINUE')}
        onPress={onSubmit}
        testID='payback_loan_button'
        margin='mt-12 mb-2 mx-4'
      />
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-center text-xs mb-12')}
      >
        {translate('screens/PaybackLoanScreen', 'Review and confirm transaction in the next screen')}
      </ThemedText>
    </ThemedScrollView>
  )
}

interface LoanTokenInputProps {
  loanTokenId: string
  displaySymbol: string
  price?: ActivePrice
  outstandingBalance: BigNumber
}

export function LoanTokenInput (props: LoanTokenInputProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border p-4 flex flex-col rounded-lg')}
    >
      <View style={tailwind('flex flex-row items-center mb-3')}>
        <SymbolIcon
          symbol={props.displaySymbol} styleProps={{
          width: 24,
          height: 24
        }}
        />
        <ThemedText style={tailwind('ml-2 font-medium')}>{props.displaySymbol}</ThemedText>
      </View>
      <View style={tailwind('flex flex-row items-center justify-between')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('screens/PaybackLoanScreen', 'Outstanding balance')}
        </ThemedText>
        <NumberFormat
          value={new BigNumber(props.outstandingBalance).toFixed(8)}
          decimalScale={8}
          thousandSeparator
          suffix={` ${props.displaySymbol}`}
          displayType='text'
          renderText={(value) =>
            <ThemedText style={tailwind('text-sm font-medium')}>
              {value}
            </ThemedText>}
        />
      </View>
    </ThemedView>
  )
}

interface VaultInputProps {
  vault: LoanVaultActive
  loanToken?: LoanToken
  displayMaxLoanAmount?: boolean
}

export function VaultInput ({
  vault,
  loanToken,
  displayMaxLoanAmount = false
}: VaultInputProps): JSX.Element {
  const vaultState = useVaultStatus(vault.state, new BigNumber(vault.collateralRatio), new BigNumber(vault.loanScheme.minColRatio), new BigNumber(vault.loanValue))
  const colors = useCollateralizationRatioColor({
    colRatio: new BigNumber(vault.collateralRatio),
    minColRatio: new BigNumber(vault.loanScheme.minColRatio),
    totalLoanAmount: new BigNumber(vault.loanValue)
  })

  const collateralAlertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collaterals deposited in a vault in relation to the loan amount, expressed in percentage.'
  }

  const minCollateralRatioInfo = {
    title: 'Min. collateralization ratio',
    message: 'Minimum required collateralization ratio based on loan scheme selected. A vault will go into liquidation when the collateralization ratio goes below the minimum requirement.'
  }

  const maxLoanAmount = useMaxLoanAmount({
    totalCollateralValue: new BigNumber(vault.collateralValue),
    totalLoanValue: new BigNumber(vault.loanValue),
    minColRatio: new BigNumber(vault.loanScheme.minColRatio),
    vaultInterest: new BigNumber(vault.loanScheme.interestRate),
    loanInterest: new BigNumber(loanToken?.interest ?? NaN),
    loanActivePrice: new BigNumber(loanToken?.activePrice?.active?.amount ?? NaN)
  })

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border p-4 flex flex-col rounded-lg mb-4')}
    >
      <View style={tailwind('flex flex-row justify-between items-center mb-2')}>
        <View>
          <ThemedText
            numberOfLines={1}
            ellipsizeMode='middle'
            style={tailwind('mr-2 w-56 flex-shrink text-sm font-medium')}
          >
            {vault.vaultId}
          </ThemedText>
        </View>
        <VaultStatusTag status={vaultState.status} vaultStats={vaultState.vaultStats} />
      </View>
      <View style={tailwind('flex flex-row items-center justify-between mb-1 mt-2')}>
        <View style={tailwind('items-center flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs mr-1')}
          >
            {translate('screens/PaybackLoanScreen', 'Collateralization ratio')}
          </ThemedText>
          <BottomSheetInfo alertInfo={collateralAlertInfo} name={collateralAlertInfo.title} infoIconStyle={tailwind('text-xs')} />
        </View>
        <NumberFormat
          value={new BigNumber(vault.collateralRatio).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix='%'
          displayType='text'
          renderText={(value) => (
            <ThemedText light={colors.light} dark={colors.dark} style={tailwind('text-sm font-medium')}>
              {value}
            </ThemedText>
          )}
        />
      </View>
      <View style={tailwind('flex flex-row items-center justify-between mb-1')}>
        <View style={tailwind('items-center flex-row')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs mr-1')}
          >
            {translate('screens/PaybackLoanScreen', 'Min. collateralization ratio')}
          </ThemedText>
          <BottomSheetInfo alertInfo={minCollateralRatioInfo} name={minCollateralRatioInfo.title} infoIconStyle={tailwind('text-xs')} />
        </View>
        <NumberFormat
          value={new BigNumber(vault.loanScheme.minColRatio).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix='%'
          displayType='text'
          renderText={(value) => (
            <ThemedText style={tailwind('text-sm font-medium')}>
              {value}
            </ThemedText>
          )}
        />
      </View>
      {displayMaxLoanAmount && loanToken !== undefined &&
        (
          <View style={tailwind('flex flex-row items-center justify-between mb-1')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-xs')}
            >
              {translate('screens/BorrowMoreScreen', 'Max loan amount')}
            </ThemedText>
            <NumberFormat
              value={maxLoanAmount.isNaN() ? translate('screens/BorrowMoreScreen', 'N/A') : maxLoanAmount.toFixed(8)}
              decimalScale={8}
              thousandSeparator
              suffix={` ${loanToken.token.displaySymbol}`}
              displayType='text'
              renderText={(value) =>
                <ThemedText style={tailwind('text-sm font-medium')}>
                  {value}
                </ThemedText>}
            />
          </View>
        )}
    </ThemedView>
  )
}

interface TransactionDetailsProps {
  amountToPay: BigNumber
  outstandingBalance: BigNumber
  fee: BigNumber
  displaySymbol: string
}

function TransactionDetailsSection (props: TransactionDetailsProps): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/PaybackLoanScreen', 'TRANSACTION DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/PaybackLoanScreen', 'Amount to pay')}
        rhs={{
          value: props.amountToPay.toFixed(8),
          testID: 'text_amount_to_pay',
          suffixType: 'text',
          suffix: props.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PaybackLoanScreen', 'Remaining loan amount')}
        rhs={{
          value: props.outstandingBalance.minus(props.amountToPay).toFixed(8),
          testID: 'text_resulting_loan_amount',
          suffixType: 'text',
          suffix: props.displaySymbol
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
