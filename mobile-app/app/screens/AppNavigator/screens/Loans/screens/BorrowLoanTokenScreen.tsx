import { Platform, View } from 'react-native'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity
} from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useCallback, useEffect, useRef, useState } from 'react'
import BigNumber from 'bignumber.js'
import { LoanParamList } from '../LoansNavigator'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { SymbolIcon } from '@components/SymbolIcon'
import NumberFormat from 'react-number-format'
import { WalletTextInput } from '@components/WalletTextInput'
import { NumberRow } from '@components/NumberRow'
import { BottomSheetVaultList } from '../components/BottomSheetVaultList'
import { fetchVaults, LoanVault, vaultsSelector } from '@store/loans'
import { LoanToken, LoanVaultActive, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
import { TextRow } from '@components/TextRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { Button } from '@components/Button'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useResultingCollateralRatio } from '../hooks/CollateralPrice'
import { CollateralizationRatioRow } from '../components/CollateralizationRatioRow'
import { useLoanOperations } from '@screens/AppNavigator/screens/Loans/hooks/LoanOperations'
import { VaultSectionTextRow } from '../components/VaultSectionTextRow'
import { useMaxLoanAmount } from '../hooks/MaxLoanAmount'
import { useInterestPerBlock } from '../hooks/InterestPerBlock'
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'
import { useBlocksPerDay } from '../hooks/BlocksPerDay'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'

type Props = StackScreenProps<LoanParamList, 'BorrowLoanTokenScreen'>

export function BorrowLoanTokenScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const {
    loanToken
  } = route.params
  const client = useWhaleApiClient()
  const logger = useLogger()
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))
  const [vault, setVault] = useState<LoanVaultActive | undefined>(route.params.vault)
  const [amountToBorrow, setAmountToBorrow] = useState({
    amountInToken: new BigNumber(0),
    amountInUSD: new BigNumber(0),
    amountInput: ''
  })
  const [totalLoanWithInterest, setTotalLoanWithInterest] = useState(new BigNumber(NaN))
  const [totalAnnualInterest, setTotalAnnualInterest] = useState(new BigNumber(NaN))
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [valid, setValid] = useState(false)
  const interestPerBlock = useInterestPerBlock(new BigNumber(vault?.loanScheme.interestRate ?? NaN), new BigNumber(loanToken.interest))
  const resultingColRatio = useResultingCollateralRatio(
    new BigNumber(vault?.collateralValue ?? NaN),
    new BigNumber(vault?.loanValue ?? NaN),
    new BigNumber(amountToBorrow.amountInToken),
    new BigNumber(getActivePrice(loanToken.token.symbol, loanToken.activePrice)),
    interestPerBlock
  )
  const blocksPerDay = useBlocksPerDay()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const canUseOperations = useLoanOperations(vault?.state)

  // Bottom sheet
  const bottomSheetRef = useRef<BottomSheetModalMethods>(null)
  const bottomSheetScreen = [
    {
      stackScreenName: 'VaultList',
      component: BottomSheetVaultList({
        headerLabel: translate('screens/BorrowLoanTokenScreen', 'Choose a vault to use'),
        onCloseButtonPress: () => dismissModal(),
        onVaultPress: (vault: LoanVaultActive) => {
          setVault(vault)
          dismissModal()
        },
        vaults
      }),
      option: {
        header: () => null
      }
    }
  ]
  const containerRef = useRef(null)
  const [isModalDisplayed, setIsModalDisplayed] = useState(false)
  const expandModal = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(true)
    } else {
      bottomSheetRef.current?.present()
    }
  }, [])
  const dismissModal = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(false)
    } else {
      bottomSheetRef.current?.close()
    }
  }, [])
  const onLoanTokenInputPress = (): void => {
    navigation.navigate({
      name: 'ChooseLoanTokenScreen',
      params: {},
      merge: true
    })
  }

  // Form update
  const [inputValidationMessage, setInputValidationMessage] = useState('')
  const isFormValid = (): boolean => {
    const amount = amountToBorrow.amountInToken
    return !(amount.isNaN() ||
      amount.isLessThanOrEqualTo(0) ||
      vault === undefined ||
      resultingColRatio === undefined ||
      resultingColRatio.isNaN() ||
      resultingColRatio.isLessThan(vault.loanScheme.minColRatio))
  }

  const updateInterestAmount = (): void => {
    const loanTokenPrice = getActivePrice(loanToken.token.symbol, loanToken.activePrice)
    if (vault === undefined || amountToBorrow.amountInput === undefined || loanTokenPrice === '0') {
      return
    }
    const annualInterest = interestPerBlock.multipliedBy(blocksPerDay * 365).multipliedBy(amountToBorrow.amountInToken)
    setTotalAnnualInterest(annualInterest)
    setTotalLoanWithInterest(amountToBorrow.amountInToken.plus(annualInterest))
  }

  const onSubmit = async (): Promise<void> => {
    if (!valid || vault === undefined || hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    navigation.navigate({
      name: 'ConfirmBorrowLoanTokenScreen',
      params: {
        loanToken: loanToken,
        vault: vault,
        amountToBorrow: amountToBorrow.amountInToken.toFixed(8),
        totalInterestAmount: interestPerBlock,
        totalLoanWithInterest,
        fee,
        resultingColRatio
      }
    })
  }

  const validateInput = (): void => {
    const amount = new BigNumber(amountToBorrow.amountInput)
    if (amount.isNaN() || amount.isZero() || vault === undefined) {
      setInputValidationMessage('')
      return
    }

    if (amount.isGreaterThan(0) && (vault.collateralValue === '0' || vault.collateralValue === undefined)) {
      setInputValidationMessage('Insufficient vault collateral to borrow this amount')
    } else if (resultingColRatio.isLessThan(vault.loanScheme.minColRatio)) {
      setInputValidationMessage('This amount may place the vault in liquidation')
    } else {
      setInputValidationMessage('')
    }
  }

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    dispatch(fetchVaults({
      address,
      client
    }))
  }, [blockCount, address])

  useEffect(() => {
    const updatedVault = vaults.find(v => v.vaultId === vault?.vaultId) as LoanVaultActive
    setVault(updatedVault)
  }, [vaults])

  useEffect(() => {
    updateInterestAmount()
  }, [amountToBorrow, vault])

  useEffect(() => {
    validateInput()
    setValid(isFormValid())
  }, [amountToBorrow, vault, totalLoanWithInterest])

  useEffect(() => {
    setAmountToBorrow({
      ...amountToBorrow,
      amountInToken: new BigNumber(amountToBorrow.amountInput),
      amountInUSD:
        amountToBorrow.amountInput === '' || new BigNumber(amountToBorrow.amountInput).isNaN()
          ? new BigNumber(0)
          : new BigNumber(amountToBorrow.amountInput).times(getActivePrice(loanToken.token.symbol, loanToken.activePrice))
    })
  }, [amountToBorrow.amountInput])

  return (
    <View style={tailwind('h-full')} ref={containerRef}>
      <ThemedScrollView>
        <View style={tailwind('px-4')}>
          <ThemedText style={tailwind('text-xl font-bold mt-6')}>
            {translate('screens/BorrowLoanTokenScreen', 'Borrow loan token')}
          </ThemedText>
          <InputLabel text='SELECT LOAN TOKEN' />
          <LoanTokenInput
            loanTokenId={loanToken.tokenId}
            displaySymbol={loanToken.token.displaySymbol}
            price={loanToken.activePrice}
            interestRate={loanToken.interest}
            onPress={onLoanTokenInputPress}
          />
          <InputLabel text='SELECT VAULT FOR COLLATERAL' />
          <VaultInput
            vault={vault}
            loanToken={loanToken}
            onPress={expandModal}
            interestPerBlock={interestPerBlock}
            testID='borrow_loan_vault'
          />
        </View>

        {vault !== undefined &&
          (
            <>
              <View style={tailwind('px-4 mb-12')}>
                <WalletTextInput
                  inputType='numeric'
                  value={amountToBorrow.amountInput}
                  title={translate('screens/BorrowLoanTokenScreen', 'How many {{token}} tokens to borrow?', { token: loanToken.token.displaySymbol })}
                  placeholder={translate('screens/BorrowLoanTokenScreen', 'Enter an amount')}
                  onChangeText={(text: string) => setAmountToBorrow({
                    ...amountToBorrow,
                    amountInput: text
                  })}
                  displayClearButton={amountToBorrow.amountInput !== ''}
                  onClearButtonPress={() => setAmountToBorrow({
                    ...amountToBorrow,
                    amountInput: ''
                  })}
                  valid={inputValidationMessage === ''}
                  inlineText={{
                    type: 'error',
                    text: translate('screens/BorrowLoanTokenScreen', inputValidationMessage)
                  }}
                  style={tailwind('h-9 w-3/5 flex-grow')}
                  testID='form_input_borrow'
                />
                <WalletTextInput
                  autoCapitalize='none'
                  editable={false}
                  placeholder='0.00'
                  style={tailwind('flex-grow w-2/5')}
                  testID='text_input_usd_value'
                  value={amountToBorrow.amountInUSD.toFixed(2)}
                  displayClearButton={false}
                  inputType='numeric'
                >
                  <ThemedText>{translate('screens/BorrowLoanTokenScreen', 'USD')}</ThemedText>
                </WalletTextInput>
              </View>
              <TransactionDetailsSection
                vault={vault}
                amountToBorrowInToken={amountToBorrow.amountInToken}
                resultingColRatio={resultingColRatio}
                vaultInterestRate={new BigNumber(vault?.loanScheme.interestRate ?? 0)}
                loanTokenInterestRate={new BigNumber(loanToken.interest)}
                loanTokenDisplaySymbol={loanToken.token.displaySymbol}
                totalInterestAmount={totalAnnualInterest}
                totalLoanWithInterest={totalLoanWithInterest}
                loanTokenPrice={new BigNumber(getActivePrice(loanToken.token.symbol, loanToken.activePrice))}
                fee={fee}
              />
              <Button
                disabled={!valid || hasPendingJob || hasPendingBroadcastJob || !canUseOperations}
                label={translate('screens/BorrowLoanTokenScreen', 'CONTINUE')}
                onPress={onSubmit}
                testID='borrow_loan_submit_button'
                margin='mt-12 mb-2 mx-4'
              />
              <ThemedText
                light={tailwind('text-gray-500', { 'text-error-500': inputValidationMessage !== '' })}
                dark={tailwind('text-gray-400', { 'text-darkerror-500': inputValidationMessage !== '' })}
                style={tailwind('text-center text-xs mb-12')}
              >
                {inputValidationMessage === ''
                  ? translate('screens/BorrowLoanTokenScreen', 'Review and confirm transaction in the next screen')
                  : translate('screens/BorrowLoanTokenScreen', 'Unable to proceed because of errors')}
              </ThemedText>
            </>
          )}
        {Platform.OS === 'web' && (
          <BottomSheetWebWithNav
            modalRef={containerRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
          />
        )}

        {Platform.OS !== 'web' && (
          <BottomSheetWithNav
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
          />
        )}
      </ThemedScrollView>
    </View>
  )
}

function InputLabel (props: { text: string }): JSX.Element {
  return (
    <ThemedText
      light={tailwind('text-gray-500')}
      dark={tailwind('text-gray-400')}
      style={tailwind('text-xs font-medium mt-4 mb-1')}
    >
      {translate('screens/BorrowLoanTokenScreen', props.text)}
    </ThemedText>
  )
}

interface LoanTokenInputProps {
  loanTokenId: string
  displaySymbol: string
  price?: ActivePrice
  interestRate: string
  onPress: () => void
}

function LoanTokenInput (props: LoanTokenInputProps): JSX.Element {
  const currentPrice = getUSDPrecisedPrice(getActivePrice(props.displaySymbol, props.price))
  return (
    <ThemedTouchableOpacity
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border py-2.5 px-4 flex flex-row items-center justify-between rounded-lg')}
      onPress={props.onPress}
    >
      <View style={tailwind('flex flex-row w-2/12 flex-1 items-center')}>
        <SymbolIcon
          symbol={props.displaySymbol} styleProps={tailwind('w-6 h-6')}
        />
        <ThemedText style={tailwind('ml-2 text-sm font-medium')}>{props.displaySymbol}</ThemedText>
      </View>
      <View style={tailwind('w-8/12 items-end flex-1')}>
        <ThemedText
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
          style={tailwind('text-xs')}
        >
          {translate('screens/BorrowLoanTokenScreen', 'Price (USD)')}
        </ThemedText>
        <NumberFormat
          value={currentPrice}
          decimalScale={2}
          thousandSeparator
          displayType='text'
          renderText={(value) =>
            <ThemedText style={tailwind('text-sm font-semibold text-right')}>
              {value}
            </ThemedText>}
          prefix='$'
        />
      </View>
      <View style={tailwind('mr-4 w-3/12 items-end')}>
        <ThemedText
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
          style={tailwind('text-xs')}
        >
          {translate('screens/BorrowLoanTokenScreen', 'Interest')}
        </ThemedText>
        <NumberFormat
          value={props.interestRate}
          decimalScale={2}
          thousandSeparator
          displayType='text'
          renderText={(value) =>
            <ThemedText style={tailwind('text-sm font-semibold text-right')}>
              {value}
            </ThemedText>}
          suffix='%'
        />
      </View>
      <ThemedIcon
        iconType='MaterialIcons'
        name='unfold-more'
        size={24}
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        style={tailwind('-mr-1.5 flex-shrink-0')}
      />
    </ThemedTouchableOpacity>
  )
}

interface VaultInputProps {
  vault?: LoanVault
  loanToken: LoanToken
  onPress: () => void
  interestPerBlock: BigNumber
  testID?: string
}

function VaultInput (props: VaultInputProps): JSX.Element {
  if (props.vault === undefined || props.vault.state === LoanVaultState.IN_LIQUIDATION) {
    return (
      <ThemedTouchableOpacity
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('border py-2.5 px-4 rounded-lg mb-8')}
        onPress={props.onPress}
        testID={props.testID}
      >
        <View style={tailwind('flex flex-row justify-between items-center py-1.5')}>
          <ThemedText
            light={tailwind('text-gray-300')}
            dark={tailwind('text-gray-700')}
            style={tailwind('text-sm')}
          >
            {translate('screens/BorrowLoanTokenScreen', 'Select a vault to use')}
          </ThemedText>
          <ThemedIcon
            iconType='MaterialIcons'
            name='unfold-more'
            size={24}
            light={tailwind('text-primary-500')}
            dark={tailwind('text-darkprimary-500')}
            style={tailwind('-mr-1.5')}
          />
        </View>
      </ThemedTouchableOpacity>
    )
  }

  return (
    <VaultInputActive
      vault={props.vault} onPress={props.onPress} loanToken={props.loanToken}
      interestPerBlock={props.interestPerBlock}
    />
  )
}

interface VaultInputActiveProps {
  vault: LoanVaultActive
  loanToken: LoanToken
  onPress: () => void
  interestPerBlock: BigNumber
}

function VaultInputActive (props: VaultInputActiveProps): JSX.Element {
  const vaultAlertInfo = {
    title: 'Annual vault interest',
    message: 'Annual vault interest rate based on the loan scheme selected.'
  }

  const maxLoanAmount = useMaxLoanAmount({
    totalCollateralValue: new BigNumber(props.vault.collateralValue),
    existingLoanValue: new BigNumber(props.vault.loanValue),
    minColRatio: new BigNumber(props.vault.loanScheme.minColRatio),
    loanActivePrice: new BigNumber(getActivePrice(props.loanToken.token.symbol, props.loanToken.activePrice)),
    interestPerBlock: props.interestPerBlock
  })

  return (
    <ThemedTouchableOpacity
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border py-2.5 px-4 rounded-lg mb-8')}
      onPress={props.onPress}
    >
      <View style={tailwind('flex flex-row items-center mb-2')}>
        <View style={tailwind('flex flex-row flex-1 items-center')}>
          <ThemedText
            ellipsizeMode='middle'
            numberOfLines={1}
            style={tailwind('w-7/12 font-medium mr-2')}
          >
            {props.vault.vaultId}
          </ThemedText>
        </View>
        <ThemedIcon
          iconType='MaterialIcons'
          name='unfold-more'
          size={24}
          light={tailwind('text-primary-500')}
          dark={tailwind('text-darkprimary-500')}
          style={tailwind('-mr-1.5')}
        />
      </View>
      <VaultSectionTextRow
        lhs={translate('screens/BorrowLoanTokenScreen', 'Total collateral (USD)')}
        value={getUSDPrecisedPrice(props.vault.collateralValue)}
        testID='total_collateral_text'
        prefix='$'
      />
      <VaultSectionTextRow
        lhs={translate('screens/BorrowLoanTokenScreen', 'Vault interest')}
        value={new BigNumber(props.vault.loanScheme.interestRate).toFixed(2)}
        suffix='%'
        suffixType='text'
        testID='vault_interest_text'
        info={vaultAlertInfo}
      />
      <VaultSectionTextRow
        lhs={translate('screens/BorrowLoanTokenScreen', 'Max loan amount')}
        value={maxLoanAmount.isNaN() ? translate('screens/BorrowLoanTokenScreen', 'N/A') : maxLoanAmount.toFixed(8)}
        suffix={` ${props.loanToken.token.displaySymbol}`}
        suffixType='text'
        testID='max_loan_amount_text'
      />
    </ThemedTouchableOpacity>
  )
}

interface TransactionDetailsProps {
  vault: LoanVaultActive
  resultingColRatio: BigNumber
  amountToBorrowInToken: BigNumber
  vaultInterestRate: BigNumber
  loanTokenInterestRate: BigNumber
  loanTokenDisplaySymbol: string
  totalInterestAmount: BigNumber
  totalLoanWithInterest: BigNumber
  loanTokenPrice: BigNumber
  fee: BigNumber
}

export function TransactionDetailsSection (props: TransactionDetailsProps): JSX.Element {
  const minCollateralRatioInfo = {
    title: 'Min. collateralization ratio',
    message: 'Minimum required collateralization ratio based on loan scheme selected. A vault will go into liquidation when the collateralization ratio goes below the minimum requirement.'
  }

  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/BorrowLoanTokenScreen', 'TRANSACTION DETAILS')}
      />
      {props.amountToBorrowInToken.isNaN() || props.amountToBorrowInToken.isLessThan(0) || props.resultingColRatio === undefined
        ? (
          <TextRow
            lhs={translate('screens/BorrowLoanTokenScreen', 'Resulting collateralization')}
            rhs={{
              value: translate('screens/BorrowLoanTokenScreen', 'N/A'),
              testID: 'text_resulting_col_ratio'
            }}
            textStyle={tailwind('text-sm font-normal')}
          />
        )
        : (
          <CollateralizationRatioRow
            label={translate('screens/BorrowLoanTokenScreen', 'Resulting collateralization')}
            value={props.resultingColRatio.toFixed(2)}
            testId='text_resulting_col_ratio'
            type='current'
            minColRatio={new BigNumber(props.vault.loanScheme.minColRatio)}
            totalLoanAmount={new BigNumber(props.vault.loanValue).plus(
              props.totalLoanWithInterest.multipliedBy(props.loanTokenPrice)
            )}
            colRatio={props.resultingColRatio}
          />
        )}
      <NumberRow
        lhs={translate('screens/BorrowLoanTokenScreen', 'Min. collateralization ratio')}
        info={minCollateralRatioInfo}
        rhs={{
          value: props.vault.loanScheme.minColRatio,
          testID: 'text_col_ratio',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
      />
      <NumberRow
        lhs={translate('screens/BorrowLoanTokenScreen', 'Interest (Vault + Token)')}
        rhs={{
          value: props.vaultInterestRate.plus(props.loanTokenInterestRate).toFixed(2),
          testID: 'text_total_interest_rate',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
      />
      <NumberRow
        lhs={translate('screens/BorrowLoanTokenScreen', 'Estimated annual interest')}
        rhs={{
          value: props.totalInterestAmount.toFixed(8),
          testID: 'text_estimated_annual_interest',
          suffixType: 'text',
          suffix: props.amountToBorrowInToken.isNaN() || props.amountToBorrowInToken.isLessThan(0) ? translate('screens/BorrowLoanTokenScreen', 'N/A') : props.loanTokenDisplaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/BorrowLoanTokenScreen', 'Total loan + annual interest')}
        rhs={{
          value: props.totalLoanWithInterest.toFixed(8),
          testID: 'text_total_loan_with_annual_interest',
          suffixType: 'text',
          suffix: props.amountToBorrowInToken.isNaN() || props.amountToBorrowInToken.isLessThan(0) ? translate('screens/BorrowLoanTokenScreen', 'N/A') : props.loanTokenDisplaySymbol
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
