import { useEffect, useMemo, useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { LoanParamList } from '@screens/AppNavigator/screens/Loans/LoansNavigator'
import { View } from 'react-native'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedText,
  ThemedView
} from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { WalletTextInput } from '@components/WalletTextInput'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { NumberRow } from '@components/NumberRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLoanOperations } from '@screens/AppNavigator/screens/Loans/hooks/LoanOperations'
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'
import { DFITokenSelector, DFIUtxoSelector, fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useInterestPerBlock } from '../hooks/InterestPerBlock'
import { useResultingCollateralRatio } from '../hooks/CollateralPrice'
import { fetchPrice, loanTokenByTokenId } from '@store/loans'
import { CollateralizationRatioValue } from '../components/CollateralizationRatioRow'
import { TextRow } from '@components/TextRow'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { PaymentTokenCards } from '../components/PaymentTokenCards'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useIsFocused } from '@react-navigation/native'
import { InputHelperText } from '@components/InputHelperText'
import { ActiveUSDValue } from '../VaultDetail/components/ActiveUSDValue'
import { PaymentTokenProps, useLoanPaymentTokenRate } from '../hooks/LoanPaymentTokenRate'
import { LoanPercentage } from '../components/LoanPercentage'
import { getUSDPrecisedPrice } from '../../Auctions/helpers/usd-precision'

type Props = StackScreenProps<LoanParamList, 'PaybackLoanScreen'>

export function PaybackLoanScreen ({
  navigation,
  route
}: Props): JSX.Element {
  const { isFeatureAvailable } = useFeatureFlagContext()
  const {
    loanTokenAmount,
    vault
  } = route.params
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const loanToken = useSelector((state: RootState) => loanTokenByTokenId(state.loans, loanTokenAmount.id))
  const paymentTokenActivePrices = useSelector((state: RootState) => state.loans.loanPaymentTokenActivePrices)
  const canUseOperations = useLoanOperations(vault?.state)
  const client = useWhaleApiClient()

  const interestPerBlock = useInterestPerBlock(new BigNumber(vault?.loanScheme.interestRate ?? NaN), new BigNumber(loanToken?.interest ?? NaN))
  const token = tokens?.find((t) => t.id === loanTokenAmount.id)
  const tokenBalance = (token != null) ? getTokenAmount(token.id, tokens) : new BigNumber(0)
  const loanTokenOutstandingBal = new BigNumber(loanTokenAmount.amount)
  const loanTokenActivePriceInUSD = getActivePrice(loanTokenAmount.symbol, loanTokenAmount.activePrice)
  const loanTokenOutstandingBalInUSD = loanTokenOutstandingBal.multipliedBy(loanTokenActivePriceInUSD)

  const [selectedPaymentToken, setSelectedPaymentToken] = useState<Omit<PaymentTokenProps, 'tokenBalance'>>({
    tokenId: loanTokenAmount.id,
    tokenSymbol: loanTokenAmount.symbol,
    tokenDisplaySymbol: loanTokenAmount.displaySymbol
  })

  const [amountToPay, setAmountToPay] = useState(BigNumber.min(loanTokenAmount.amount, tokenBalance).toFixed(8))
  const { getPaymentTokens, getPaymentPenalty } = useLoanPaymentTokenRate({
    loanToken: {
      id: loanTokenAmount.id,
      displaySymbol: loanTokenAmount.displaySymbol,
      symbol: loanTokenAmount.symbol
    },
    loanTokenBalance: tokenBalance,
    loanTokenAmountActivePriceInUSD: new BigNumber(loanTokenActivePriceInUSD),
    outstandingBalance: loanTokenOutstandingBal,
    amountToPay: new BigNumber(amountToPay)
  })

  const {
    paymentTokensWithAmount,
    paymentPenalty
  } = useMemo(() => {
    const { paymentTokenAmounts } = getPaymentTokens()
    return {
      paymentTokensWithAmount: paymentTokenAmounts,
      paymentPenalty: getPaymentPenalty(selectedPaymentToken.tokenSymbol)
    }
  }, [amountToPay, selectedPaymentToken, paymentTokenActivePrices])

  const {
    isExcess,
    amountToPayInLoanToken,
    amountToPayInPaymentToken,
    totalPaybackWithInterest,
    hasSufficientPaymentTokenBalance,
    selectedPaymentTokenBalance,
    cappedAmount,
    outstandingBalanceInPaymentToken
  } = useMemo(() => {
    const selectedPaymentTokenWithAmount = paymentTokensWithAmount.find(pTokenWithAmount => pTokenWithAmount.paymentToken.tokenId === selectedPaymentToken.tokenId) ??
    {
      amountToPayInLoanToken: new BigNumber(NaN),
      amountToPayInPaymentToken: new BigNumber(NaN),
      cappedAmount: new BigNumber(NaN),
      outstandingBalanceInPaymentToken: new BigNumber(NaN),
      paymentToken: {
        tokenBalance: new BigNumber(NaN),
        tokenDisplaySymbol: '',
        tokenId: '',
        tokenSymbol: ''
      }
    }
    const amountToPayInLoanToken = selectedPaymentTokenWithAmount.amountToPayInLoanToken
    const amountToPayInPaymentToken = selectedPaymentTokenWithAmount.amountToPayInPaymentToken

    return {
      isExcess: new BigNumber(amountToPayInPaymentToken).isGreaterThan(selectedPaymentTokenWithAmount.outstandingBalanceInPaymentToken),
      totalPaybackWithInterest: new BigNumber(amountToPayInLoanToken).plus(interestPerBlock),
      cappedAmount: selectedPaymentTokenWithAmount.cappedAmount,
      amountToPayInPaymentToken,
      amountToPayInLoanToken,
      hasSufficientPaymentTokenBalance: selectedPaymentTokenWithAmount.paymentToken.tokenBalance.gte(amountToPayInPaymentToken),
      selectedPaymentTokenBalance: getTokenAmount(selectedPaymentToken.tokenId, tokens),
      outstandingBalanceInPaymentToken: selectedPaymentTokenWithAmount.outstandingBalanceInPaymentToken
    }
  }, [paymentTokensWithAmount, selectedPaymentToken])

  useEffect(() => {
    setAmountToPay(cappedAmount.toFixed(8))
  }, [selectedPaymentToken])

  const [isInputEmpty, setIsInputEmpty] = useState(true)
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))

  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const logger = useLogger()

  // Resulting col ratio
  const resultingColRatio = useResultingCollateralRatio(
    new BigNumber(vault?.collateralValue ?? NaN),
    new BigNumber(vault?.loanValue ?? NaN),
    BigNumber.min(amountToPayInLoanToken, loanTokenAmount.amount).multipliedBy(-1),
    new BigNumber(getActivePrice(loanTokenAmount.symbol, loanTokenAmount?.activePrice)),
    interestPerBlock
  )

  // Conversion
  const {
    isConversionRequired,
    conversionAmount
  } = useConversion({
    inputToken: {
      type: selectedPaymentToken.tokenId === '0_unified' ? 'token' : 'others',
      amount: new BigNumber(selectedPaymentToken.tokenId === '0_unified' ? BigNumber.min(selectedPaymentTokenBalance, amountToPayInPaymentToken.plus(paymentPenalty)) : 0)
    },
    deps: [selectedPaymentToken, amountToPayInPaymentToken, JSON.stringify(tokens)]
  })

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTokens({
        client,
        address
      }))

      if (loanTokenAmount.symbol === 'DUSD') {
        dispatch(fetchPrice({
          client,
          currency: 'USD',
          token: 'DFI'
        }))
      } else {
        dispatch(fetchPrice({
          client,
          currency: 'USD',
          token: loanTokenAmount.symbol
        }))
      }
    }
  }, [address, blockCount, isFocused])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    return setIsInputEmpty(new BigNumber(amountToPay).isNaN())
  }, [amountToPay])

  const onPaymentTokenSelect = (paymentToken: PaymentTokenProps): void => {
    setSelectedPaymentToken(paymentToken)
  }

  const navigateToConfirmScreen = (): void => {
    navigation.navigate({
      name: 'ConfirmPaybackLoanScreen',
      params: {
        vault,
        amountToPayInLoanToken: new BigNumber(amountToPayInLoanToken),
        amountToPayInPaymentToken: amountToPayInPaymentToken,
        selectedPaymentTokenBalance: selectedPaymentTokenBalance,
        loanTokenBalance: loanTokenOutstandingBal,
        paymentToken: selectedPaymentToken,
        fee,
        loanTokenAmount,
        excessAmount: isExcess ? new BigNumber(amountToPayInPaymentToken).minus(outstandingBalanceInPaymentToken) : undefined,
        resultingColRatio,
        paymentPenalty,
        ...(isConversionRequired && {
          conversion: {
            isConversionRequired,
            DFIToken,
            DFIUtxo,
            conversionAmount
          }
        })
      },
      merge: true
    })
  }

  const onChangeFromAmount = (amount: string): void => {
    setAmountToPay(amount)
  }

  const onSubmit = async (): Promise<void> => {
    if (!hasSufficientPaymentTokenBalance || vault === undefined || hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    if (isConversionRequired) {
      queueConvertTransaction({
        mode: 'utxosToAccount',
        amount: conversionAmount
      }, dispatch, () => {
        navigateToConfirmScreen()
      }, logger)
    } else {
      navigateToConfirmScreen()
    }
  }

  return (
    <ThemedScrollView contentContainerStyle={tailwind('pb-8')}>
      <LoanTokenInput
        loanTokenId={loanTokenAmount.id}
        displaySymbol={loanTokenAmount.displaySymbol}
        outstandingBalanceInUSD={loanTokenOutstandingBalInUSD}
        outstandingBalance={loanTokenOutstandingBal}
      />
      <ThemedView
        light={tailwind('bg-white')}
        dark={tailwind('bg-gray-800')}
        style={tailwind('pb-4 flex flex-col flex-1')}
      >
        {
          isFeatureAvailable('dfi_loan_payment') && paymentTokensWithAmount.length > 1 &&
            <PaymentTokenCards
              onPaymentTokenSelect={onPaymentTokenSelect}
              paymentTokens={paymentTokensWithAmount.map(pTokenWithAmount => ({
              ...pTokenWithAmount,
              isSelected: selectedPaymentToken.tokenId === pTokenWithAmount.paymentToken.tokenId
            }))}
              selectedPaymentTokenSymbol={selectedPaymentToken.tokenSymbol}
              loanTokenSymbol={loanTokenAmount.symbol}
            />
        }
        <View style={tailwind('mt-4 px-4')}>
          <WalletTextInput
            inputType='numeric'
            value={amountToPay}
            title={translate('screens/PaybackLoanScreen', 'Amount to pay')}
            placeholder={translate('screens/PaybackLoanScreen', 'Enter an amount')}
            onChangeText={(text) => setAmountToPay(text)}
            displayClearButton={amountToPay !== ''}
            onClearButtonPress={() => setAmountToPay('')}
            style={tailwind('h-9 w-2/5 flex-grow')}
            testID='payback_input_text'
            valid={hasSufficientPaymentTokenBalance || isInputEmpty}
            {...(!hasSufficientPaymentTokenBalance && !isInputEmpty && {
              inlineText: {
                type: 'error',
                text: translate('screens/PaybackLoanScreen', 'Insufficient {{token}} to pay for the entered amount', { token: selectedPaymentToken.tokenDisplaySymbol })
              }
            })}
          >
            <>
              <SetAmountButton
                amount={new BigNumber(outstandingBalanceInPaymentToken)}
                onPress={onChangeFromAmount}
                type={AmountButtonTypes.half}
              />
              <SetAmountButton
                amount={cappedAmount}
                onPress={onChangeFromAmount}
                type={AmountButtonTypes.max}
                customText='MAX'
              />
            </>
          </WalletTextInput>
          <InputHelperText
            label={`${translate('screens/PaybackLoanScreen', 'Available')}: `}
            content={new BigNumber(selectedPaymentTokenBalance).toFixed(8)}
            styleProps={tailwind('font-medium leading-5')}
            suffix={` ${selectedPaymentToken.tokenDisplaySymbol}`}
            testID='available_token_balance'
          />
        </View>
        {isConversionRequired && hasSufficientPaymentTokenBalance && <ConversionInfoText style={tailwind('mx-4')} />}
        <LoanPercentage
          amountToPayInPaymentToken={amountToPayInPaymentToken}
          loanTokenOutstandingBalance={loanTokenOutstandingBal}
          outstandingBalanceInPaymentToken={outstandingBalanceInPaymentToken}
          amountToPayInLoanToken={amountToPayInLoanToken}
          paymentTokenDisplaySymbol={selectedPaymentToken.tokenDisplaySymbol}
          loanTokenDisplaySymbol={loanTokenAmount.displaySymbol}
        />
      </ThemedView>
      {
        hasSufficientPaymentTokenBalance && amountToPayInPaymentToken.gt(0) &&
          <View style={tailwind('mt-4')}>
            <TransactionDetailsSection
              fee={fee}
              outstandingBalance={loanTokenOutstandingBal}
              outstandingBalanceInPaymentToken={outstandingBalanceInPaymentToken}
              displaySymbol={loanTokenAmount.displaySymbol}
              isExcess={isExcess}
              resultingColRatio={resultingColRatio}
              vault={vault}
              loanTokenPrice={new BigNumber(getActivePrice(loanTokenAmount.symbol, loanToken?.activePrice))}
              totalPaybackWithInterest={totalPaybackWithInterest}
              selectedPaymentToken={selectedPaymentToken}
              amountToPayInLoanToken={amountToPayInLoanToken}
              amountToPayInPaymentToken={amountToPayInPaymentToken}
              paymentPenalty={paymentPenalty}
            />
            {isExcess && (
              <ThemedText
                light={tailwind('text-gray-500')}
                dark={tailwind('text-gray-400')}
                style={tailwind('text-xs mt-2 mx-4')}
              >
                {translate('screens/PaybackLoanScreen', 'Any excess amount will be returned to your wallet.')}
              </ThemedText>
          )}
          </View>
      }
      <View style={tailwind('mt-4 mb-2')}>
        <SubmitButtonGroup
          isDisabled={!hasSufficientPaymentTokenBalance || amountToPayInPaymentToken.lte(0) || hasPendingJob || hasPendingBroadcastJob || !canUseOperations}
          label={translate('screens/PaybackLoanScreen', 'CONTINUE')}
          processingLabel={translate('screens/PaybackLoanScreen', 'CONTINUE')}
          onSubmit={onSubmit}
          title='payback_loan_continue'
          isProcessing={hasPendingJob || hasPendingBroadcastJob}
          displayCancelBtn={false}
        />
      </View>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-center text-xs mb-12')}
      >
        {isConversionRequired
          ? translate('screens/PaybackLoanScreen', 'Authorize transaction in the next screen to convert')
          : translate('screens/PaybackLoanScreen', 'Review and confirm transaction in the next screen')}
      </ThemedText>
    </ThemedScrollView>
  )
}

interface LoanTokenInputProps {
  loanTokenId: string
  displaySymbol: string
  outstandingBalance: BigNumber
  outstandingBalanceInUSD: BigNumber
}

export function LoanTokenInput (props: LoanTokenInputProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('p-4 m-4 flex flex-col rounded-lg flex-row items-center justify-between')}
    >
      <ThemedText
        light={tailwind('text-gray-400')}
        dark={tailwind('text-gray-500')}
        style={tailwind('text-sm')}
      >
        {translate('screens/PaybackLoanScreen', 'Loan amount')}
      </ThemedText>
      <View style={tailwind('items-end')}>
        <NumberFormat
          value={new BigNumber(props.outstandingBalance).toFixed(8)}
          decimalScale={8}
          thousandSeparator
          suffix={` ${props.displaySymbol}`}
          displayType='text'
          renderText={(value) =>
            <ThemedText testID='loan_outstanding_balance' style={tailwind('text-sm font-medium')}>
              {value}
            </ThemedText>}
        />
        <ActiveUSDValue
          price={new BigNumber(props.outstandingBalanceInUSD)}
          testId='loan_outstanding_balance_usd'
        />
      </View>
    </ThemedView>
  )
}

interface TransactionDetailsProps {
  outstandingBalance: BigNumber
  outstandingBalanceInPaymentToken: BigNumber
  fee: BigNumber
  displaySymbol: string
  isExcess: boolean
  resultingColRatio: BigNumber
  vault: LoanVaultActive
  totalPaybackWithInterest: BigNumber
  loanTokenPrice: BigNumber
  selectedPaymentToken: Omit<PaymentTokenProps, 'tokenBalance'>
  amountToPayInLoanToken: BigNumber
  amountToPayInPaymentToken: BigNumber
  paymentPenalty: BigNumber
}

function TransactionDetailsSection ({
  outstandingBalance,
  outstandingBalanceInPaymentToken,
  fee,
  displaySymbol,
  isExcess,
  resultingColRatio,
  vault,
  totalPaybackWithInterest,
  loanTokenPrice,
  selectedPaymentToken,
  amountToPayInLoanToken,
  amountToPayInPaymentToken,
  paymentPenalty
}: TransactionDetailsProps): JSX.Element {
  const [isExpanded, setisExpanded] = useState(false)
  // TODO(PIERRE): Display collateral alter info
  // const collateralAlertInfo = {
  //   title: 'Collateralization ratio',
  //   message: 'The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.'
  // }

  const rowStyle = {
    style: tailwind('flex flex-row pb-1'),
    dark: tailwind('bg-gray-800 border-gray-700'),
    light: tailwind('bg-white border-gray-200'),
    lhsThemedProps: {
      light: tailwind('text-gray-500'),
      dark: tailwind('text-gray-400')
    },
    rhsThemedProps: {
      light: tailwind('text-gray-900'),
      dark: tailwind('text-gray-50')
    }
  }

  return (
    <ThemedView>
      <ThemedView
        style={tailwind(['flex flex-row py-4 mx-4 rounded-t', {
          'border-b': !isExpanded
        }])}
        dark={tailwind('bg-gray-800 border-gray-700')}
        light={tailwind('bg-white border-gray-200')}
      >
        <View style={tailwind('flex flex-row w-11/12 pl-4 items-center')}>
          <View style={tailwind('w-8/12')}>
            <ThemedText style={tailwind('text-sm font-normal justify-between')} {...rowStyle.lhsThemedProps}>
              {translate('screens/PaybackLoanScreen', 'Resulting collateralization')}
            </ThemedText>
          </View>
          <View
            style={tailwind('flex-1 flex-row justify-end flex-wrap items-center')}
          >
            {
              resultingColRatio.isLessThan(0)
                ? <ThemedText testID='resulting_col'>{translate('screens/ConfirmBorrowLoanTokenScreen', 'N/A')}</ThemedText>
                : <CollateralizationRatioValue
                    testId='text_resulting_col_ratio'
                    value={resultingColRatio.toFixed(2)}
                    minColRatio={new BigNumber(vault.loanScheme.minColRatio)}
                    totalLoanAmount={new BigNumber(vault.loanValue).minus(
                    BigNumber.min(totalPaybackWithInterest.multipliedBy(loanTokenPrice), 0)
                  )}
                    type='current'
                    colRatio={resultingColRatio}
                  />
            }
          </View>
        </View>
        <ThemedIcon
          onPress={() => {
            setisExpanded(!isExpanded)
          }}
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          iconType='MaterialIcons'
          name={!isExpanded ? 'expand-more' : 'expand-less'}
          size={24}
          testID='toggle_resulting_col'
        />
      </ThemedView>
      {isExpanded &&
        <ThemedView
          style={tailwind('px-4 mx-4 py-1 border-b')}
          dark={tailwind('bg-gray-800 border-gray-700')}
          light={tailwind('bg-white border-gray-200')}
        >
          <TextRow
            containerStyle={{
              style: tailwind('flex flex-row pb-1'),
              dark: tailwind('bg-gray-800 border-gray-700'),
              light: tailwind('bg-white border-gray-200')
            }}
            lhs={{
              value: translate('screens/PaybackLoanScreen', 'Vault ID'),
              themedProps: rowStyle.lhsThemedProps,
              testID: 'lhs_vault_id'
            }}
            rhs={{
              value: vault.vaultId,
              testID: 'text_vault_id',
              numberOfLines: 1,
              ellipsizeMode: 'middle',
              themedProps: rowStyle.rhsThemedProps
            }}
            textStyle={tailwind('text-xs font-normal')}
          />
          <TextRow
            containerStyle={{
              style: tailwind('flex flex-row pb-1'),
              dark: tailwind('bg-gray-800 border-gray-700'),
              light: tailwind('bg-white border-gray-200')
            }}
            lhs={{
              value: translate('screens/PaybackLoanScreen', 'Min. col. ratio'),
              themedProps: rowStyle.lhsThemedProps,
              testID: 'lhs_min_col_ratio'
            }}
            rhs={{
              value: `${getUSDPrecisedPrice(vault.loanScheme.minColRatio)}%`,
              testID: 'text_min_col_ratio',
              numberOfLines: 1,
              ellipsizeMode: 'middle',
              themedProps: rowStyle.rhsThemedProps
            }}
            textStyle={tailwind('text-xs font-normal')}
          />
          <NumberRow
            {...rowStyle}
            lhs={translate('screens/PaybackLoanScreen', 'Total collateral (USD)')}
            rhs={{
              value: getUSDPrecisedPrice(vault.collateralValue),
              testID: 'text_total_collateral_usd',
              prefix: '$'
            }}
            textStyle={tailwind('text-xs font-normal')}
          />
          <NumberRow
            {...rowStyle}
            lhs={translate('screens/PaybackLoanScreen', 'Total loan (USD)')}
            rhs={{
              value: getUSDPrecisedPrice(vault.loanValue),
              testID: 'text_total_loan_usd',
              prefix: '$'
            }}
            textStyle={tailwind('text-xs font-normal')}
          />
        </ThemedView>}
      <View style={tailwind('mx-4')}>
        {isExcess &&
          (
            <NumberRow
              lhs={translate('screens/PaybackLoanScreen', 'Excess amount')}
              rhs={{
                value: amountToPayInPaymentToken.minus(outstandingBalanceInPaymentToken).toFixed(8),
                testID: 'text_excess_amount',
                suffixType: 'text',
                suffix: selectedPaymentToken.tokenDisplaySymbol
              }}
              lhsThemedProps={rowStyle.lhsThemedProps}
              rhsThemedProps={rowStyle.rhsThemedProps}
            />
          )}
        <NumberRow
          lhs={translate('screens/PaybackLoanScreen', 'Loan remaining')}
          rhs={{
            value: BigNumber.max(outstandingBalance.minus(amountToPayInLoanToken), 0).toFixed(8),
            testID: 'text_resulting_loan_amount',
            suffixType: 'text',
            suffix: displaySymbol
          }}
          lhsThemedProps={rowStyle.lhsThemedProps}
          rhsThemedProps={rowStyle.rhsThemedProps}
        />
        {paymentPenalty.gt(0) &&
          <NumberRow
            lhs={translate('screens/PaybackLoanScreen', '{{paymentToken}} payment fee', { paymentToken: selectedPaymentToken.tokenDisplaySymbol })}
            rhs={{
              value: BigNumber.max(paymentPenalty, 0).toFixed(8),
              testID: 'text_resulting_payment_penalty',
              suffixType: 'text',
              suffix: selectedPaymentToken.tokenDisplaySymbol
            }}
            lhsThemedProps={rowStyle.lhsThemedProps}
            rhsThemedProps={rowStyle.rhsThemedProps}
          />}
        <FeeInfoRow
          type='ESTIMATED_FEE'
          value={fee.toFixed(8)}
          testID='estimated_fee'
          suffix='DFI'
          lhsThemedProps={rowStyle.lhsThemedProps}
          rhsThemedProps={rowStyle.rhsThemedProps}
          containerStyle={{
            style: tailwind('rounded-b p-4 flex-row items-start w-full'),
            dark: tailwind('bg-gray-800'),
            light: tailwind('bg-white')
          }}
        />
      </View>
    </ThemedView>
  )
}

const getTokenAmount = (tokenId: string, tokens: WalletToken[]): BigNumber => {
  const id = tokenId === '0' ? '0_unified' : tokenId
  return new BigNumber(tokens.find((t) => t.id === id)?.amount ?? 0)
}
