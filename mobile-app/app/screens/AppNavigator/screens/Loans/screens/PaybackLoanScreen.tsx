import { useEffect, useMemo, useState } from 'react'
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
import { useDispatch, useSelector } from 'react-redux'
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
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'
import { DFITokenSelector, DFIUtxoSelector, fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useInterestPerBlock } from '../hooks/InterestPerBlock'
import { useResultingCollateralRatio } from '../hooks/CollateralPrice'
import { fetchPrice, loanTokenByTokenId } from '@store/loans'
import { CollateralizationRatioRow } from '../components/CollateralizationRatioRow'
import { TextRow } from '@components/TextRow'
import { NumberRowWithConversion } from '../components/NumberRowWithConversion'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { PaymentTokenCards } from '../components/PaymentTokenCards'
import { useLoanPaymentTokenRate } from '../hooks/LoanPaymentTokenRate'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { useIsFocused } from '@react-navigation/native'

type Props = StackScreenProps<LoanParamList, 'PaybackLoanScreen'>

export interface PaymentTokenProps {
  tokenId: string
  tokenSymbol: string
  tokenDisplaySymbol: string
  tokenBalance: BigNumber
}

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
  const canUseOperations = useLoanOperations(vault?.state)
  const client = useWhaleApiClient()

  const loanTokenOutstandingBal = new BigNumber(loanTokenAmount.amount)
  const token = tokens?.find((t) => t.id === loanTokenAmount.id)
  const tokenBalance = (token != null) ? getTokenAmount(token.id, tokens) : new BigNumber(0)
  const loanTokenAmountActivePriceInUSD = getActivePrice(loanTokenAmount.symbol, loanTokenAmount.activePrice)
  const [amountToPay, setAmountToPay] = useState(BigNumber.min(loanTokenOutstandingBal).toFixed(8))
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<PaymentTokenProps>({
    tokenId: loanTokenAmount.id,
    tokenSymbol: loanToken?.token.symbol ?? '',
    tokenDisplaySymbol: loanToken?.token.displaySymbol ?? '',
    tokenBalance
  })
  const selectedPaymentTokenBalance = getTokenAmount(selectedPaymentToken.tokenId, tokens)

  const paymentTokens = useMemo(() => {
    return token === undefined ? [] : getPaymentTokens(token, tokenBalance, selectedPaymentToken.tokenId, tokens)
  }, [token])
  const { getAmounts } = useLoanPaymentTokenRate({
    loanToken,
    loanTokenAmountActivePriceInUSD: new BigNumber(loanTokenAmountActivePriceInUSD),
    paymentTokens: paymentTokens.map(pToken => ({
      ...pToken.paymentToken
    })),
    outstandingBalance: loanTokenOutstandingBal,
    amountToPay: new BigNumber(amountToPay),
    loanTokenBalance: tokenBalance
  })

  const [paymentTokensWithAmount, setPaymentTokensWithAmount] = useState<Array<{
    paymentToken: {
      tokenId: string
      tokenSymbol: string
      tokenDisplaySymbol: string
      tokenBalance: BigNumber
      resultingBalance?: BigNumber
      amountToPayInPaymentToken?: BigNumber
      amountToPayInLoanToken?: BigNumber
    }
    isSelected: boolean
  }>>(paymentTokens)
  const {
    isExcess,
    amountToPayInLoanToken,
    amountToPayInPaymentToken,
    resultingBalance,
    totalPaybackWithInterest,
    hasSufficientPaymentTokenBalance
  } = useMemo(() => {
    const selectedPaymentTokenWithAmount = paymentTokensWithAmount.find(pTokenWithAmount => pTokenWithAmount.paymentToken.tokenId === selectedPaymentToken.tokenId)
    const amountToPayInLoanToken = selectedPaymentTokenWithAmount?.paymentToken.amountToPayInLoanToken ?? new BigNumber(NaN)
    const amountToPayInPaymentToken = selectedPaymentTokenWithAmount?.paymentToken.amountToPayInPaymentToken ?? new BigNumber(NaN)

    return {
      isExcess: new BigNumber(amountToPayInLoanToken).isGreaterThan(loanTokenAmount.amount),
      totalPaybackWithInterest: new BigNumber(amountToPayInLoanToken).plus(interestPerBlock),
      resultingBalance: selectedPaymentTokenWithAmount?.paymentToken.resultingBalance ?? new BigNumber(NaN),
      amountToPayInPaymentToken,
      amountToPayInLoanToken,
      hasSufficientPaymentTokenBalance: selectedPaymentTokenBalance.gte(amountToPayInPaymentToken)
    }
  }, [paymentTokensWithAmount, selectedPaymentToken, selectedPaymentTokenBalance])
  const [isInputEmpty, setIsInputEmpty] = useState(true)
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))

  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const logger = useLogger()

  // Resulting col ratio
  const interestPerBlock = useInterestPerBlock(new BigNumber(vault?.loanScheme.interestRate ?? NaN), new BigNumber(loanToken?.interest ?? NaN))
  const resultingColRatio = useResultingCollateralRatio(
    new BigNumber(vault?.collateralValue ?? NaN),
    new BigNumber(vault?.loanValue ?? NaN),
    BigNumber.min(amountToPay, loanTokenAmount.amount).multipliedBy(-1),
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
      amount: new BigNumber(selectedPaymentToken.tokenId === '0_unified' ? amountToPayInPaymentToken : 0)
    },
    deps: [selectedPaymentToken, amountToPayInPaymentToken, JSON.stringify(tokens)]
  })

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTokens({
        client,
        address
      }))
      if (paymentTokens.length > 1) {
        dispatch(fetchPrice({
          client,
          currency: 'USD',
          token: paymentTokens[1].paymentToken.tokenDisplaySymbol
        }))
      }
    }
  }, [address, blockCount, isFocused])

  useEffect(() => {
    const { paymentTokenAmounts } = getAmounts()
    const updatedPaymentTokenAmounts = paymentTokens.map((pToken) => {
      const pTokenWithAmount = paymentTokenAmounts.find(pTokenWithAmount => pTokenWithAmount.paymentToken.tokenId === pToken.paymentToken.tokenId)
      return {
        ...pToken,
        paymentToken: {
          ...pToken.paymentToken,
          amountToPayInPaymentToken: pTokenWithAmount?.amountToPayInPaymentToken ?? new BigNumber(NaN),
          amountToPayInLoanToken: pTokenWithAmount?.amountToPayInLoanToken ?? new BigNumber(NaN),
          resultingBalance: pTokenWithAmount?.resultingBalance ?? new BigNumber(NaN)
        }
      }
    })

    setPaymentTokensWithAmount(updatedPaymentTokenAmounts)
  }, [amountToPay, paymentTokens])

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
        amountToPay: new BigNumber(amountToPayInLoanToken),
        amountToPayInSelectedToken: amountToPayInPaymentToken,
        paymentToken: selectedPaymentToken,
        fee,
        loanTokenAmount,
        excessAmount: isExcess ? new BigNumber(amountToPay).minus(loanTokenAmount.amount) : undefined,
        resultingColRatio,
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
    <ThemedScrollView contentContainerStyle={tailwind('pb-8 pt-2')}>
      <ThemedSectionTitle
        text={translate('screens/PaybackLoanScreen', 'YOU ARE PAYING FOR LOAN')}
      />
      <View style={tailwind('px-4')}>
        <LoanTokenInput
          loanTokenId={loanTokenAmount.id}
          displaySymbol={loanTokenAmount.displaySymbol}
          price={loanTokenAmount.activePrice}
          outstandingBalance={loanTokenOutstandingBal}
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
          title={translate('screens/PaybackLoanScreen', 'How much of the loan do you want to pay?')}
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
              amount={loanTokenOutstandingBal}
              onPress={onChangeFromAmount}
              type={AmountButtonTypes.half}
            />

            <SetAmountButton
              amount={loanTokenOutstandingBal}
              onPress={onChangeFromAmount}
              type={AmountButtonTypes.max}
              customText='100%'
            />
          </>
        </WalletTextInput>
      </View>
      {paymentTokens?.length > 1 && isFeatureAvailable('dfi_loan_payment') &&
        <PaymentTokenCards
          onPaymentTokenSelect={onPaymentTokenSelect}
          paymentTokens={paymentTokensWithAmount.map(pTokenWithAmount => ({
            ...pTokenWithAmount,
            isSelected: selectedPaymentToken.tokenId === pTokenWithAmount.paymentToken.tokenId
          }))}
          selectedPaymentTokenSymbol={selectedPaymentToken.tokenSymbol}
        />}
      {isConversionRequired && hasSufficientPaymentTokenBalance && <ConversionInfoText />}
      {
        hasSufficientPaymentTokenBalance &&
          <View style={tailwind('mt-4')}>
            <TransactionDetailsSection
              fee={fee}
              outstandingBalance={loanTokenOutstandingBal}
              displaySymbol={loanTokenAmount.displaySymbol}
              isExcess={isExcess}
              resultingColRatio={resultingColRatio}
              vault={vault}
              loanTokenPrice={new BigNumber(getActivePrice(loanToken?.token.symbol ?? '', loanToken?.activePrice))}
              totalPaybackWithInterest={totalPaybackWithInterest}
              selectedPaymentToken={selectedPaymentToken}
              resultingBalance={resultingBalance}
              amountToPayInLoanToken={amountToPayInLoanToken}
              amountToPayInPaymentToken={amountToPayInPaymentToken}
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
      <Button
        disabled={!hasSufficientPaymentTokenBalance || hasPendingJob || hasPendingBroadcastJob || !canUseOperations}
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
          symbol={props.displaySymbol} styleProps={tailwind('w-6 h-6')}
        />
        <ThemedText testID='loan_symbol' style={tailwind('ml-2 font-medium')}>{props.displaySymbol}</ThemedText>
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
            <ThemedText testID='loan_outstanding_balance' style={tailwind('text-sm font-medium')}>
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
  interestPerBlock?: BigNumber
}

export function VaultInput ({
  vault,
  loanToken,
  displayMaxLoanAmount = false,
  interestPerBlock
}: VaultInputProps): JSX.Element {
  const vaultState = useVaultStatus(vault.state, new BigNumber(vault.collateralRatio), new BigNumber(vault.loanScheme.minColRatio), new BigNumber(vault.loanValue), new BigNumber(vault.collateralValue))
  const colors = useCollateralizationRatioColor({
    colRatio: new BigNumber(vault.collateralRatio),
    minColRatio: new BigNumber(vault.loanScheme.minColRatio),
    totalLoanAmount: new BigNumber(vault.loanValue),
    totalCollateralValue: new BigNumber(vault.collateralValue)
  })

  const collateralAlertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.'
  }

  const minCollateralRatioInfo = {
    title: 'Min. collateralization ratio',
    message: 'Minimum required collateralization ratio based on loan scheme selected. A vault will go into liquidation when the collateralization ratio goes below the minimum requirement.'
  }

  const maxLoanAmount = useMaxLoanAmount({
    totalCollateralValue: new BigNumber(vault.collateralValue),
    existingLoanValue: new BigNumber(vault.loanValue),
    minColRatio: new BigNumber(vault.loanScheme.minColRatio),
    loanActivePrice: new BigNumber(getActivePrice(loanToken?.token.symbol ?? '', loanToken?.activePrice)),
    interestPerBlock: interestPerBlock ?? new BigNumber(NaN)
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
            testID='vault_id'
          >
            {vault.vaultId}
          </ThemedText>
        </View>
        <VaultStatusTag status={vaultState.status} testID='vault_status_tag' />
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
          <BottomSheetInfo
            alertInfo={collateralAlertInfo} name={collateralAlertInfo.title}
            infoIconStyle={tailwind('text-xs')}
          />
        </View>
        <NumberFormat
          value={new BigNumber(vault.collateralRatio === '-1' ? NaN : vault.collateralRatio).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix={vault.collateralRatio === '-1' ? translate('screens/PaybackLoanScreen', 'N/A') : '%'}
          displayType='text'
          renderText={(value) => (
            <ThemedText
              testID='loan_col_ratio' light={colors.light} dark={colors.dark}
              style={tailwind('text-sm font-medium')}
            >
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
          <BottomSheetInfo
            alertInfo={minCollateralRatioInfo} name={minCollateralRatioInfo.title}
            infoIconStyle={tailwind('text-xs')}
          />
        </View>
        <NumberFormat
          value={new BigNumber(vault.loanScheme.minColRatio).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix='%'
          displayType='text'
          renderText={(value) => (
            <ThemedText testID='loan_min_col' style={tailwind('text-sm font-medium')}>
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
              {translate('screens/PaybackLoanScreen', 'Max loan amount')}
            </ThemedText>
            <NumberFormat
              value={maxLoanAmount.isNaN() ? translate('screens/PaybackLoanScreen', 'N/A') : maxLoanAmount.toFixed(8)}
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
  outstandingBalance: BigNumber
  fee: BigNumber
  displaySymbol: string
  isExcess: boolean
  resultingColRatio: BigNumber
  vault: LoanVaultActive
  totalPaybackWithInterest: BigNumber
  loanTokenPrice: BigNumber
  selectedPaymentToken: PaymentTokenProps
  resultingBalance: BigNumber
  amountToPayInLoanToken: BigNumber
  amountToPayInPaymentToken: BigNumber
}

function TransactionDetailsSection ({
  outstandingBalance,
  fee,
  displaySymbol,
  isExcess,
  resultingColRatio,
  vault,
  totalPaybackWithInterest,
  loanTokenPrice,
  selectedPaymentToken,
  resultingBalance,
  amountToPayInLoanToken,
  amountToPayInPaymentToken
}: TransactionDetailsProps): JSX.Element {
  const collateralAlertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collateral deposited in a vault in relation to the loan amount, expressed in percentage.'
  }

  return (
    <>
      <NumberRowWithConversion
        lhs={translate('screens/PaybackLoanScreen', 'Amount to pay')}
        rhs={{
          value: amountToPayInPaymentToken.toFixed(8),
          testID: 'text_amount_to_pay_converted',
          suffixType: 'text',
          suffix: selectedPaymentToken.tokenDisplaySymbol,
          style: tailwind('ml-0')
        }}
        {...(selectedPaymentToken.tokenDisplaySymbol !== displaySymbol && {
          rhsConversion: {
            value: amountToPayInLoanToken.toFixed(8),
            testID: 'text_amount_to_pay',
            suffixType: 'text',
            suffix: displaySymbol,
            style: tailwind('ml-0')
          }
        })
        }
      />
      {isExcess &&
        (
          <NumberRow
            lhs={translate('screens/PaybackLoanScreen', 'Excess amount')}
            rhs={{
              value: amountToPayInLoanToken.minus(outstandingBalance).toFixed(8),
              testID: 'text_excess_amount',
              suffixType: 'text',
              suffix: displaySymbol
            }}
          />
        )}
      <NumberRow
        lhs={translate('screens/PaybackLoanScreen', 'Resulting {{displaySymbol}} Balance', { displaySymbol: selectedPaymentToken.tokenDisplaySymbol })}
        rhs={{
          value: BigNumber.max(resultingBalance, 0).toFixed(8),
          testID: 'text_resulting_balance',
          suffixType: 'text',
          suffix: selectedPaymentToken.tokenDisplaySymbol
        }}
      />
      <TextRow
        lhs={translate('screens/PaybackLoanScreen', 'Vault ID')}
        rhs={{
          value: vault.vaultId,
          testID: 'text_vault_id',
          numberOfLines: 1,
          ellipsizeMode: 'middle'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/PaybackLoanScreen', 'Remaining loan amount')}
        rhs={{
          value: BigNumber.max(outstandingBalance.minus(amountToPayInLoanToken), 0).toFixed(8),
          testID: 'text_resulting_loan_amount',
          suffixType: 'text',
          suffix: displaySymbol
        }}
      />
      {resultingColRatio.isLessThan(0)
        ? (
          <TextRow
            lhs={translate('screens/PaybackLoanScreen', 'Resulting collateralization')}
            rhs={{
              value: translate('screens/PaybackLoanScreen', 'N/A'),
              testID: 'text_resulting_col_ratio'
            }}
            textStyle={tailwind('text-sm font-normal')}
            info={collateralAlertInfo}
          />
        )
        : (
          <CollateralizationRatioRow
            label={translate('screens/PaybackLoanScreen', 'Resulting collateralization')}
            value={resultingColRatio.toFixed(2)}
            testId='text_resulting_col_ratio'
            type='current'
            minColRatio={new BigNumber(vault.loanScheme.minColRatio)}
            totalLoanAmount={new BigNumber(vault.loanValue).minus(
              totalPaybackWithInterest.multipliedBy(loanTokenPrice)
            )}
            colRatio={resultingColRatio}
          />
        )}
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toFixed(8)}
        testID='estimated_fee'
        suffix='DFI'
      />
    </>
  )
}

const getTokenAmount = (tokenId: string, tokens: WalletToken[]): BigNumber => {
  const id = tokenId === '0' ? '0_unified' : tokenId
  return new BigNumber(tokens.find((t) => t.id === id)?.amount ?? 0)
}

const getPaymentTokens = (loanToken: WalletToken, tokenBalance: BigNumber, selectedPaymentTokenId: string, tokens: any): Array<{
  paymentToken: PaymentTokenProps
  isSelected: boolean
}> => {
  const paymentTokens = [{
    paymentToken: {
      tokenId: loanToken.id,
      tokenSymbol: loanToken.symbol,
      tokenDisplaySymbol: loanToken.displaySymbol,
      tokenBalance: tokenBalance
    },
    isSelected: selectedPaymentTokenId === loanToken.id
  }]

  /*
    Feature: Allow DFI payments on DUSD loans
  */
  if (loanToken.displaySymbol === 'DUSD') {
    return [...paymentTokens, {
      paymentToken: {
        tokenId: '0_unified',
        tokenSymbol: 'DFI',
        tokenDisplaySymbol: 'DFI',
        tokenBalance: getTokenAmount('0_unified', tokens)
      },
      isSelected: selectedPaymentTokenId === '0_unified'
    }]
  }

  return paymentTokens
}
