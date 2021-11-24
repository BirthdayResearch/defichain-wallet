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
import React, { useCallback, useEffect, useRef, useState } from 'react'
import BigNumber from 'bignumber.js'
import { LoanParamList } from '../LoansNavigator'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { SymbolIcon } from '@components/SymbolIcon'
import NumberFormat from 'react-number-format'
import { WalletTextInput } from '@components/WalletTextInput'
import { NumberRow } from '@components/NumberRow'
import { BottomSheetVaultList } from '../components/BottomSheetVaultList'
import { fetchVaults, LoanVault } from '@store/loans'
import { LoanVaultActive, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
import { TextRow } from '@components/TextRow'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { Button } from '@components/Button'
import { useDispatch, useSelector } from 'react-redux'
import { DFITokenSelector, DFIUtxoSelector } from '@store/wallet'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useVaultStatus, VaultStatusTag } from '@screens/AppNavigator/screens/Loans/components/VaultStatusTag'
import { queueConvertTransaction } from '@hooks/wallet/Conversion'
import { useResultingCollateralRatio } from '../hooks/CollateralPrice'
import { CollateralizationRatioRow } from '../components/CollateralizationRatioRow'
import { useInterestPerBlock } from '../hooks/InterestPerBlock'
import { useLoanOperations } from '@screens/AppNavigator/screens/Loans/hooks/LoanOperations'
import { BottomSheetInfo } from '@components/BottomSheetInfo'

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
  const vaults = useSelector((state: RootState) => (state.loans.vaults))
  const [vault, setVault] = useState<LoanVaultActive | undefined>(route.params.vault)
  const [amountToBorrow, setAmountToBorrow] = useState('')
  const [totalInterestAmount, setTotalInterestAmount] = useState(new BigNumber(NaN))
  const [totalLoanWithInterest, setTotalLoanWithInterest] = useState(new BigNumber(NaN))
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [valid, setValid] = useState(false)
  const resultingColRatio = useResultingCollateralRatio(new BigNumber(vault?.collateralValue ?? NaN), new BigNumber(vault?.loanValue ?? NaN),
  new BigNumber(totalLoanWithInterest), new BigNumber(loanToken.activePrice?.active?.amount ?? 0))
  const interestPerBlock = useInterestPerBlock(new BigNumber(vault?.loanScheme.interestRate ?? 0), new BigNumber(loanToken.interest), new BigNumber(amountToBorrow))

  // Conversion
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const isConversionRequired = new BigNumber(0.1).gt(DFIUtxo.amount)
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
  const isFormValid = (): boolean => {
    const amount = new BigNumber(amountToBorrow)
    return !(amount.isNaN() ||
      amount.isLessThanOrEqualTo(0) ||
      vault === undefined ||
      resultingColRatio === undefined ||
      resultingColRatio.isNaN() ||
      resultingColRatio.isLessThan(vault.loanScheme.minColRatio) ||
      interestPerBlock.isLessThanOrEqualTo(0.00000009))
  }

  const updateInterestAmount = (): void => {
    if (vault === undefined || amountToBorrow === undefined || loanToken.activePrice?.active?.amount === undefined) {
      return
    }
    const vaultInterestRate = new BigNumber(vault.loanScheme.interestRate).div(100)
    const loanTokenInterestRate = new BigNumber(loanToken.interest).div(100)
    setTotalInterestAmount(new BigNumber(amountToBorrow).multipliedBy(vaultInterestRate.plus(loanTokenInterestRate)))
    setTotalLoanWithInterest(new BigNumber(amountToBorrow).multipliedBy(vaultInterestRate.plus(loanTokenInterestRate).plus(1)))
  }

  const onSubmit = async (): Promise<void> => {
    if (!valid || vault === undefined || hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    if (isConversionRequired) {
      queueConvertTransaction({
        mode: 'accountToUtxos',
        amount: new BigNumber(0.1).minus(DFIUtxo.amount)
      }, dispatch, () => {
        navigation.navigate({
          name: 'ConfirmBorrowLoanTokenScreen',
          params: {
            loanToken: loanToken,
            vault: vault,
            amountToBorrow,
            totalInterestAmount,
            totalLoanWithInterest,
            fee,
            conversion: {
              DFIUtxo,
              DFIToken,
              isConversionRequired,
              conversionAmount: new BigNumber(0.1).minus(DFIUtxo.amount)
            }
          }
        })
      }, logger)
    } else {
      navigation.navigate({
        name: 'ConfirmBorrowLoanTokenScreen',
        params: {
          loanToken: loanToken,
          vault: vault,
          amountToBorrow,
          totalInterestAmount,
          totalLoanWithInterest,
          fee
        }
      })
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
  }, [blockCount])

  useEffect(() => {
    const updatedVault = vaults.find(v => v.vaultId === vault?.vaultId) as LoanVaultActive
    setVault(updatedVault)
  }, [vaults])

  useEffect(() => {
    updateInterestAmount()
  }, [amountToBorrow, vault])

  useEffect(() => {
    setValid(isFormValid())
  }, [amountToBorrow, vault, totalLoanWithInterest])

  return (
    <View ref={containerRef}>
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
            onPress={expandModal}
          />
        </View>

        {vault !== undefined &&
        (
          <>
            <View style={tailwind('px-4')}>
              <WalletTextInput
                inputType='numeric'
                value={amountToBorrow}
                title={translate('screens/BorrowLoanTokenScreen', 'How much do you want to borrow?')}
                placeholder={translate('screens/BorrowLoanTokenScreen', 'Enter an amount')}
                onChangeText={(text) => setAmountToBorrow(text)}
                displayClearButton={amountToBorrow !== ''}
                onClearButtonPress={() => setAmountToBorrow('')}
                containerStyle='mb-12'
                style={tailwind('h-9 w-3/5 flex-grow')}
              />
            </View>
            <TransactionDetailsSection
              vault={vault}
              amountToBorrow={new BigNumber(amountToBorrow)}
              resultingColRatio={resultingColRatio}
              vaultInterestRate={new BigNumber(vault?.loanScheme.interestRate ?? 0)}
              loanTokenInterestRate={new BigNumber(loanToken.interest)}
              loanTokenDisplaySymbol={loanToken.token.displaySymbol}
              totalInterestAmount={totalInterestAmount}
              totalLoanWithInterest={totalLoanWithInterest}
              loanTokenPrice={new BigNumber(loanToken.activePrice?.active?.amount ?? 0)}
              fee={fee}
            />
            {isConversionRequired && (
              <View style={tailwind('mt-4 mx-4')}>
                <ConversionInfoText />
              </View>
            )}
            <Button
              disabled={!valid || hasPendingJob || hasPendingBroadcastJob || !canUseOperations}
              label={translate('screens/BorrowLoanTokenScreen', 'CONTINUE')}
              onPress={onSubmit}
              testID='add_collateral_button'
              margin='mt-12 mb-2 mx-4'
            />
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-center text-xs mb-12')}
            >
              {translate('screens/BorrowLoanTokenScreen', 'Review and confirm transaction in the next screen')}
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
  const currentPrice = props.price?.active?.amount ?? 0
  return (
    <ThemedTouchableOpacity
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border py-2.5 px-4 flex flex-row items-center justify-between rounded-lg')}
      onPress={props.onPress}
    >
      <View style={tailwind('flex flex-row w-2/12 flex-1 items-center')}>
        <SymbolIcon
          symbol={props.displaySymbol} styleProps={{
          width: 24,
          height: 24
        }}
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
          value={currentPrice > 0 ? new BigNumber(currentPrice).toFixed(2) : '-'}
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
  onPress: () => void
}

function VaultInput (props: VaultInputProps): JSX.Element {
  if (props.vault === undefined || props.vault.state === LoanVaultState.IN_LIQUIDATION) {
    return (
      <ThemedTouchableOpacity
        light={tailwind('bg-white border-gray-200')}
        dark={tailwind('bg-gray-800 border-gray-700')}
        style={tailwind('border py-2.5 px-4 rounded-lg mb-8')}
        onPress={props.onPress}
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

  return <VaultInputActive vault={props.vault} onPress={props.onPress} />
}

interface VaultInputActiveProps {
  vault: LoanVaultActive
  onPress: () => void
}

function VaultInputActive (props: VaultInputActiveProps): JSX.Element {
  const vaultState = useVaultStatus(props.vault.state, new BigNumber(props.vault.collateralRatio), new BigNumber(props.vault.loanScheme.minColRatio), new BigNumber(props.vault.loanValue))
  const vaultAlertInfo = {
    title: 'Annual vault interest',
    message: 'Annual vault interest rate based on the loan scheme selected.'
  }
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
          <VaultStatusTag status={vaultState.status} vaultStats={vaultState.vaultStats} />
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
      <View style={tailwind('flex flex-row items-center justify-between mb-1')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('screens/BorrowLoanTokenScreen', 'Total collateral (USD)')}
        </ThemedText>
        <NumberFormat
          value={props.vault.collateralValue}
          decimalScale={2}
          thousandSeparator
          prefix='$'
          displayType='text'
          renderText={(value) =>
            <ThemedText style={tailwind('text-xs')}>
              {value}
            </ThemedText>}
        />
      </View>
      <View style={tailwind('flex flex-row items-center justify-between')}>
        <View style={tailwind('flex-row items-center')}>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-xs mr-1')}
          >
            {translate('screens/BorrowLoanTokenScreen', 'Vault interest')}
          </ThemedText>
          <BottomSheetInfo alertInfo={vaultAlertInfo} name={vaultAlertInfo.title} infoIconStyle={tailwind('text-xs')} />
        </View>
        <NumberFormat
          value={props.vault.loanScheme.interestRate}
          decimalScale={2}
          thousandSeparator
          suffix='%'
          displayType='text'
          renderText={(value) =>
            <ThemedText style={tailwind('text-xs')}>
              {value}
            </ThemedText>}
        />
      </View>
    </ThemedTouchableOpacity>
  )
}

interface TransactionDetailsProps {
  vault: LoanVaultActive
  resultingColRatio: BigNumber
  amountToBorrow: BigNumber
  vaultInterestRate: BigNumber
  loanTokenInterestRate: BigNumber
  loanTokenDisplaySymbol: string
  totalInterestAmount: BigNumber
  totalLoanWithInterest: BigNumber
  loanTokenPrice: BigNumber
  fee: BigNumber
}

export function TransactionDetailsSection (props: TransactionDetailsProps): JSX.Element {
  const resultingVaultState = useVaultStatus(
    props.vault.state,
    props.resultingColRatio,
    new BigNumber(props.vault.loanScheme.minColRatio),
    new BigNumber(props.vault.loanValue).plus(
      props.totalLoanWithInterest.multipliedBy(props.loanTokenPrice)
    )
  )

  const minCollateralRatioInfo = {
    title: 'Min. collateralization ratio',
    message: 'Minimum required collateralization ratio based on loan scheme selected. A vault will go into liquidation when the collateralization ratio goes below the minimum requirement.'
  }

  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/BorrowLoanTokenScreen', 'TRANSACTION DETAILS')}
      />
      {props.amountToBorrow.isNaN() || props.amountToBorrow.isLessThan(0) || props.resultingColRatio === undefined
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
            vaultState={resultingVaultState}
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
        lhs={translate('screens/BorrowLoanTokenScreen', 'Total interest amount')}
        rhs={{
          value: props.totalInterestAmount.toFixed(8),
          testID: 'text_total_interest_amount',
          suffixType: 'text',
          suffix: props.amountToBorrow.isNaN() || props.amountToBorrow.isLessThan(0) ? translate('screens/BorrowLoanTokenScreen', 'N/A') : props.loanTokenDisplaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/BorrowLoanTokenScreen', 'Total loan + interest')}
        rhs={{
          value: props.totalLoanWithInterest.toFixed(8),
          testID: 'text_total_interest_amount',
          suffixType: 'text',
          suffix: props.amountToBorrow.isNaN() || props.amountToBorrow.isLessThan(0) ? translate('screens/BorrowLoanTokenScreen', 'N/A') : props.loanTokenDisplaySymbol
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
