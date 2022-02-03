import { useEffect, useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { LoanParamList } from '@screens/AppNavigator/screens/Loans/LoansNavigator'
import { Text, View } from 'react-native'
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
import { DFITokenSelector, DFIUtxoSelector, fetchTokens, tokensSelector } from '@store/wallet'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useInterestPerBlock } from '../hooks/InterestPerBlock'
import { useResultingCollateralRatio } from '../hooks/CollateralPrice'
import { fetchPrice, loanTokenByTokenId } from '@store/loans'
import { CollateralizationRatioRow } from '../components/CollateralizationRatioRow'
import { TextRow } from '@components/TextRow'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'
import { NumberRowWithConversion } from '../components/NumberRowWithConversion'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { PaymentTokenCards } from '../components/PaymentTokenCards'
import { useLoanPaymentTokenRate } from '../hooks/LoanPaymentTokenRate'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'

type Props = StackScreenProps<LoanParamList, 'PaybackLoanScreen'>
export interface PaymentTokenProps {
  tokenId: string
  tokenSymbol: string
  tokenDisplaySymbol: string
}

export function PaybackLoanScreen ({
  navigation,
  route
}: Props): JSX.Element {
  const {
    loanTokenAmount,
    vault
  } = route.params
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const loanToken = useSelector((state: RootState) => loanTokenByTokenId(state.loans, loanTokenAmount.id))
  const getTokenAmount = (tokenId: string): BigNumber => {
    const id = tokenId === '0' ? '0_unified' : tokenId
    return new BigNumber(tokens.find((t) => t.id === id)?.amount ?? 0)
  }

  const canUseOperations = useLoanOperations(vault?.state)
  const client = useWhaleApiClient()
  const token = tokens?.find((t) => t.id === loanTokenAmount.id)
  const tokenBalance = (token != null) ? getTokenAmount(token.id) : new BigNumber(0)
  const loanTokenAmountActivePriceInUSD = getActivePrice(loanTokenAmount.symbol, loanTokenAmount.activePrice)
  const loanTokenBalanceInUSD = tokenBalance.multipliedBy(loanTokenAmountActivePriceInUSD)

  const [amountToPay, setAmountToPay] = useState(loanTokenAmount.amount)
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<PaymentTokenProps>({
    tokenId: loanTokenAmount.id,
    tokenSymbol: loanToken?.token.symbol ?? '',
    tokenDisplaySymbol: loanToken?.token.displaySymbol ?? ''
  })
  const selectedPaymentTokenBalance = getTokenAmount(selectedPaymentToken.tokenId)
  const { conversionRate } = useLoanPaymentTokenRate({
    loanToken,
    loanTokenAmountActivePriceInUSD: new BigNumber(loanTokenAmountActivePriceInUSD),
    selectedPaymentToken
  })
  const [amountToPayInSelectedToken, setAmountToPayInSelectedToken] = useState(new BigNumber(amountToPay))
  const hasSufficientPaymentTokenBalance = selectedPaymentTokenBalance.gte(amountToPayInSelectedToken)
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [isValid, setIsValid] = useState(false)
  const [isExcess, setIsExcess] = useState(false)

  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const logger = useLogger()

  // Resulting col ratio
  const [totalPaybackWithInterest, setTotalPaybackWithInterest] = useState(new BigNumber(NaN))
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
      amount: new BigNumber(selectedPaymentToken.tokenId === '0_unified' ? amountToPayInSelectedToken : 0)
    },
    deps: [selectedPaymentToken, amountToPayInSelectedToken, JSON.stringify(tokens)]
  })

  const paymentTokens = [
    {
      displaySymbol: 'DFI',
      paymentToken: {
        tokenId: '0_unified',
        tokenSymbol: 'DFI',
        tokenDisplaySymbol: 'DFI'
      },
      isSelected: selectedPaymentToken.tokenId === '0_unified'
    }
  ]

  const isFormValid = (amountToPay: string): boolean => {
    const amount = new BigNumber(amountToPay)

    return !(amount.isNaN() || amount.isLessThanOrEqualTo(0))
  }

  useEffect(() => {
    dispatch(fetchTokens({ client, address }))
    dispatch(fetchPrice({ client, currency: 'USD', token: paymentTokens[0].displaySymbol }))
  }, [address, blockCount])

  useEffect(() => {
    const isValid = isFormValid(amountToPay)
    setIsValid(isValid)
    setIsExcess(new BigNumber(amountToPay).isGreaterThan(loanTokenAmount.amount))
    setTotalPaybackWithInterest(new BigNumber(amountToPay).plus(interestPerBlock))
    const loanTokenToSelectedTokenAmount = new BigNumber(amountToPay).isNaN() ? new BigNumber(0) : new BigNumber(amountToPay).multipliedBy(conversionRate)
    setAmountToPayInSelectedToken(loanTokenToSelectedTokenAmount)
  }, [amountToPay, selectedPaymentToken, conversionRate])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  const onPaymentTokenSelect = (paymentToken: PaymentTokenProps): void => {
    setSelectedPaymentToken(paymentToken)
  }

  const navigateToConfirmScreen = (): void => {
    navigation.navigate({
      name: 'ConfirmPaybackLoanScreen',
      params: {
        vault,
        amountToPay: new BigNumber(amountToPay),
        amountToPayInSelectedToken: amountToPayInSelectedToken,
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
    if (!isValid || !hasSufficientPaymentTokenBalance || vault === undefined || hasPendingJob || hasPendingBroadcastJob) {
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
          outstandingBalance={new BigNumber(loanTokenAmount.amount)}
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
          valid={hasSufficientPaymentTokenBalance}
          {...(!hasSufficientPaymentTokenBalance && {
 inlineText: {
            type: 'error',
            text: translate('screens/PaybackLoanScreen', 'Insufficient {{token}} balance to pay the entered amount', { token: selectedPaymentToken.tokenDisplaySymbol })
          }
})}
        >
          <>
            <SetAmountButton
              amount={new BigNumber(loanTokenAmount.amount ?? '0')}
              onPress={onChangeFromAmount}
              type={AmountButtonTypes.half}
            />

            <SetAmountButton
              amount={new BigNumber(loanTokenAmount.amount ?? '0')}
              onPress={onChangeFromAmount}
              type={AmountButtonTypes.max}
            />
          </>
        </WalletTextInput>
        <InputHelperText
          label={`${translate('screens/PaybackLoanScreen', 'Available')}: `}
          content={new BigNumber(tokenBalance).toFixed(8)}
          suffixType='component'
          styleProps={tailwind('font-medium leading-5')}
        >
          <ThemedText
            light={tailwind('text-gray-700')}
            dark={tailwind('text-gray-200')}
            style={tailwind('text-sm font-medium')}
          >
            <Text>{' '}</Text>
            <Text>{loanTokenAmount.displaySymbol}</Text>
            <NumberFormat
              value={getUSDPrecisedPrice(loanTokenBalanceInUSD)}
              thousandSeparator
              displayType='text'
              prefix='$'
              renderText={(val: string) => (
                <ThemedText
                  dark={tailwind('text-gray-400')}
                  light={tailwind('text-gray-500')}
                  style={tailwind('text-xs leading-5')}
                >
                  {` /${val}`}
                </ThemedText>
              )}
            />
          </ThemedText>
        </InputHelperText>
      </View>
      {loanTokenAmount.symbol === 'DUSD' &&
        <PaymentTokenCards
          onPaymentTokenSelect={onPaymentTokenSelect}
          paymentTokens={[{
            displaySymbol: loanTokenAmount.displaySymbol,
            paymentToken: {
              tokenId: loanTokenAmount.id,
              tokenSymbol: loanTokenAmount.symbol,
              tokenDisplaySymbol: loanTokenAmount.displaySymbol
            },
            isSelected: selectedPaymentToken.tokenId === loanTokenAmount.id
          }, ...paymentTokens]}
          loanTokenAmount={loanTokenAmount}
        />}
      {isConversionRequired && isValid && <ConversionInfoText />}
      {
        isValid &&
          <View style={tailwind('mt-4')}>
            <TransactionDetailsSection
              fee={fee} outstandingBalance={new BigNumber(loanTokenAmount.amount)}
              amountToPay={new BigNumber(amountToPay)}
              displaySymbol={loanTokenAmount.displaySymbol}
              isExcess={isExcess}
              resultingColRatio={resultingColRatio}
              vault={vault}
              loanTokenPrice={new BigNumber(getActivePrice(loanToken?.token.symbol ?? '', loanToken?.activePrice))}
              totalPaybackWithInterest={totalPaybackWithInterest}
              selectedPaymentToken={selectedPaymentToken}
              amountToPayInSelectedToken={amountToPayInSelectedToken}
              selectedPaymentTokenBalance={selectedPaymentTokenBalance}
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
        disabled={!isValid || !hasSufficientPaymentTokenBalance || hasPendingJob || hasPendingBroadcastJob || !canUseOperations}
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
    message: 'The collateralization ratio represents the amount of collaterals deposited in a vault in relation to the loan amount, expressed in percentage.'
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
          <BottomSheetInfo alertInfo={collateralAlertInfo} name={collateralAlertInfo.title} infoIconStyle={tailwind('text-xs')} />
        </View>
        <NumberFormat
          value={new BigNumber(vault.collateralRatio === '-1' ? NaN : vault.collateralRatio).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix={vault.collateralRatio === '-1' ? translate('screens/PaybackLoanScreen', 'N/A') : '%'}
          displayType='text'
          renderText={(value) => (
            <ThemedText testID='loan_col_ratio' light={colors.light} dark={colors.dark} style={tailwind('text-sm font-medium')}>
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
  amountToPay: BigNumber
  outstandingBalance: BigNumber
  fee: BigNumber
  displaySymbol: string
  isExcess: boolean
  resultingColRatio: BigNumber
  vault: LoanVaultActive
  totalPaybackWithInterest: BigNumber
  loanTokenPrice: BigNumber
  selectedPaymentToken: PaymentTokenProps
  amountToPayInSelectedToken: BigNumber
  selectedPaymentTokenBalance: BigNumber
}

function TransactionDetailsSection (props: TransactionDetailsProps): JSX.Element {
  const collateralAlertInfo = {
    title: 'Collateralization ratio',
    message: 'The collateralization ratio represents the amount of collaterals deposited in a vault in relation to the loan amount, expressed in percentage.'
  }

  return (
    <>
      <NumberRowWithConversion
        lhs={translate('screens/PaybackLoanScreen', 'Amount to pay')}
        rhs={{
          value: props.amountToPayInSelectedToken.toFixed(8),
          testID: 'text_amount_to_pay_converted',
          suffixType: 'text',
          suffix: props.selectedPaymentToken.tokenDisplaySymbol,
          style: tailwind('ml-0')
        }}
        {...(props.selectedPaymentToken.tokenDisplaySymbol !== props.displaySymbol && {
            rhsConversion: {
              value: props.amountToPay.toFixed(8),
              testID: 'text_amount_to_pay',
              suffixType: 'text',
              suffix: props.displaySymbol,
              style: tailwind('ml-0')
            }
          })
        }
      />
      {props.isExcess &&
        (
          <NumberRow
            lhs={translate('screens/PaybackLoanScreen', 'Excess amount')}
            rhs={{
              value: props.amountToPay.minus(props.outstandingBalance).toFixed(8),
              testID: 'text_resulting_loan_amount',
              suffixType: 'text',
              suffix: props.displaySymbol
            }}
          />
      )}
      {props.selectedPaymentToken.tokenDisplaySymbol !== props.displaySymbol &&
        <NumberRow
          lhs={translate('screens/PaybackLoanScreen', 'Resulting {{displaySymbol}} Balance', { displaySymbol: props.selectedPaymentToken.tokenDisplaySymbol })}
          rhs={{
            value: BigNumber.max(props.selectedPaymentTokenBalance.minus(props.amountToPay), 0).toFixed(8),
            testID: 'text_resulting_dfi_balance',
            suffixType: 'text',
            suffix: props.selectedPaymentToken.tokenDisplaySymbol
          }}
        />}
      <TextRow
        lhs={translate('screens/PaybackLoanScreen', 'Vault ID')}
        rhs={{
          value: props.vault.vaultId,
          testID: 'text_vault_id',
          numberOfLines: 1,
          ellipsizeMode: 'middle'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/PaybackLoanScreen', 'Remaining loan amount')}
        rhs={{
          value: BigNumber.max(props.outstandingBalance.minus(props.amountToPay), 0).toFixed(8),
          testID: 'text_resulting_loan_amount',
          suffixType: 'text',
          suffix: props.displaySymbol
        }}
      />
      {props.resultingColRatio.isLessThan(0)
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
            value={props.resultingColRatio.toFixed(2)}
            testId='text_resulting_col_ratio'
            type='current'
            minColRatio={new BigNumber(props.vault.loanScheme.minColRatio)}
            totalLoanAmount={new BigNumber(props.vault.loanValue).minus(
              props.totalPaybackWithInterest.multipliedBy(props.loanTokenPrice)
            )}
            colRatio={props.resultingColRatio}
          />
      )}
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={props.fee.toFixed(8)}
        testID='estimated_fee'
        suffix='DFI'
      />
    </>
  )
}
