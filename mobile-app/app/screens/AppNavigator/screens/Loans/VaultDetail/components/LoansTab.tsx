import BigNumber from 'bignumber.js'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { SymbolIcon } from '@components/SymbolIcon'
import { IconButton } from '@components/IconButton'
import { translate } from '@translations'
import { fetchVaults, LoanVault } from '@store/loans'
import { LoanVaultActive, LoanVaultState, LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import { VaultSectionTextRow } from '../../components/VaultSectionTextRow'
import { EmptyLoan } from './EmptyLoan'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { LoanParamList } from '@screens/AppNavigator/screens/Loans/LoansNavigator'
import { useLoanOperations } from '@screens/AppNavigator/screens/Loans/hooks/LoanOperations'
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'
import { ActiveUSDValue } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue'
import { BottomSheetNavScreen } from '@components/BottomSheetWithNav'
import { Text, View } from 'react-native'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { memo, useState, useEffect } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import NumberFormat from 'react-number-format'
import { getPrecisedTokenValue } from '@screens/AppNavigator/screens/Auctions/helpers/precision-token-value'
import { useSignBidAndSend } from '@screens/AppNavigator/screens/Auctions/hooks/SignBidAndSend'
import { Dispatch } from '@reduxjs/toolkit'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { transactionQueue } from '@store/transaction_queue'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { IconTooltip } from '@components/tooltip/IconTooltip'

interface LoanCardProps {
  symbol: string
  displaySymbol: string
  amount: string
  interestAmount?: string
  vaultState: LoanVaultState
  vault?: LoanVaultActive
  loanToken: LoanVaultTokenAmount
  dismissModal: () => void
  expandModal: () => void
  setBottomSheetScreen: (val: BottomSheetNavScreen[]) => void
}

export function LoansTab (props: {
  vault: LoanVault
  dismissModal: () => void
  expandModal: () => void
  setBottomSheetScreen: (val: BottomSheetNavScreen[]) => void
}): JSX.Element {
  const { vault, dismissModal, expandModal, setBottomSheetScreen } = props
  return (
    <ThemedView
      style={tailwind('p-4')}
    >
      {vault.state === LoanVaultState.ACTIVE && vault.loanValue === '0' &&
      (
        <EmptyLoan vaultId={vault.vaultId} />
      )}
      {vault.state === LoanVaultState.IN_LIQUIDATION
        ? (
          vault.batches.map(batch => (
            <LoanCard
              key={batch.loan.id}
              symbol={batch.loan.id}
              displaySymbol={batch.loan.displaySymbol}
              amount={batch.loan.amount}
              vaultState={LoanVaultState.IN_LIQUIDATION}
              loanToken={batch.loan}
              dismissModal={dismissModal}
              expandModal={expandModal}
              setBottomSheetScreen={setBottomSheetScreen}
            />
            )
          )
        )
        : (
          vault.loanAmounts.map(loan => (
            <LoanCard
              key={loan.id}
              symbol={loan.symbol}
              displaySymbol={loan.displaySymbol}
              amount={loan.amount}
              interestAmount={vault.interestAmounts.find(interest => interest.symbol === loan.symbol)?.amount}
              vaultState={vault.state}
              vault={vault}
              loanToken={loan}
              dismissModal={dismissModal}
              expandModal={expandModal}
              setBottomSheetScreen={setBottomSheetScreen}
            />
          ))
        )}

    </ThemedView>
  )
}

function LoanCard (props: LoanCardProps): JSX.Element {
  const canUseOperations = useLoanOperations(props.vault?.state)
  const activePrice = new BigNumber(getActivePrice(props.symbol, props.loanToken.activePrice))
  const isDUSDAsCollateral = props.vault?.collateralAmounts?.some(({ symbol }) => symbol === 'DUSD')
  const { isFeatureAvailable } = useFeatureFlagContext()

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('p-4 mb-2 border rounded')}
    >
      <View style={tailwind('flex flex-row items-center')}>
        <SymbolIcon
          symbol={props.displaySymbol} styleProps={tailwind('w-4 h-4')}
        />
        <ThemedText
          light={tailwind({
            'text-gray-300': props.vaultState === LoanVaultState.IN_LIQUIDATION,
            'text-black': props.vaultState !== LoanVaultState.IN_LIQUIDATION
          })}
          dark={tailwind({
            'text-gray-700': props.vaultState === LoanVaultState.IN_LIQUIDATION,
            'text-white': props.vaultState !== LoanVaultState.IN_LIQUIDATION
          })}
          style={tailwind('font-medium ml-2')}
          testID={`loan_card_${props.displaySymbol}`}
        >
          {props.displaySymbol}
        </ThemedText>
      </View>
      <View style={tailwind('mt-3')}>
        <VaultSectionTextRow
          value={new BigNumber(props.amount).toFixed(8)}
          lhs={translate('components/VaultDetailsLoansTab', 'Outstanding balance')}
          testID={`loan_card_${props.displaySymbol}_outstanding_balance`}
          suffixType='text'
          suffix={` ${props.displaySymbol}`}
          style={tailwind('text-sm font-medium')}
          rhsThemedProps={{
            light: tailwind({
              'text-gray-300': props.vaultState === LoanVaultState.IN_LIQUIDATION,
              'text-black': props.vaultState !== LoanVaultState.IN_LIQUIDATION
            }),
            dark: tailwind({
              'text-gray-700': props.vaultState === LoanVaultState.IN_LIQUIDATION,
              'text-white': props.vaultState !== LoanVaultState.IN_LIQUIDATION
            })
          }}
        />
        <ActiveUSDValue
          price={new BigNumber(props.amount).multipliedBy(activePrice)}
          containerStyle={tailwind('justify-end')}
          isOraclePrice
        />
        {props.vaultState !== LoanVaultState.IN_LIQUIDATION &&
        (
          <>
            <View style={tailwind('pt-1.5')}>
              <VaultSectionTextRow
                value={new BigNumber(props.interestAmount ?? 0).toFixed(8)}
                lhs={translate('components/VaultDetailsLoansTab', 'Interest amount')}
                testID='text_interest_amount'
                suffixType='text'
                suffix={` ${props.displaySymbol}`}
                info={{
                title: 'Interest amount',
                message: 'This amount is the total interest amount from both vault and token interest rate.'
              }}
              />
              <ActiveUSDValue
                price={new BigNumber(props.interestAmount ?? 0).multipliedBy(activePrice)}
                containerStyle={tailwind('justify-end')}
                isOraclePrice
              />
            </View>
          </>
        )}
      </View>
      {props.vault !== undefined && (
        <View style={tailwind('mt-4 -mb-2')}>
          <ActionButtons
            testID={`loan_card_${props.displaySymbol}`}
            vault={props.vault} loanToken={props.loanToken}
            canUseOperations={canUseOperations}
          />
          {isDUSDAsCollateral !== undefined && props.displaySymbol === 'DUSD' && isFeatureAvailable('poof_dusd') && (
            <PaybackDUSDLoan
              vault={props.vault}
              paybackAmount={new BigNumber(props.loanToken.amount)}
              activePrice={activePrice}
              loanToken={props.loanToken}
              dismissModal={props.dismissModal}
              expandModal={props.expandModal}
              setBottomSheetScreen={props.setBottomSheetScreen}
            />
          )}
        </View>
      )}
    </ThemedView>
  )
}

function PaybackDUSDLoan ({ loanToken, vault, dismissModal, expandModal, setBottomSheetScreen, paybackAmount, activePrice }: {
  vault: LoanVaultActive
  loanToken: LoanVaultTokenAmount
  paybackAmount: BigNumber
  activePrice: BigNumber
  dismissModal: () => void
  expandModal: () => void
  setBottomSheetScreen: (val: BottomSheetNavScreen[]) => void
}): JSX.Element {
  const dispatch = useAppDispatch()
  const logger = useLogger()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const navigation = useNavigation<NavigationProp<LoanParamList>>()
  const { address } = useWalletContext()
  const client = useWhaleApiClient()
  const collateralDUSDAmount = vault?.collateralAmounts?.find(({ symbol }) => symbol === 'DUSD')?.amount ?? 0

  async function onSubmit (): Promise<void> {
    if (vault !== undefined) {
        await paybackLoanToken({
          loanToken,
          vaultId: vault?.vaultId,
          amount: BigNumber.min(collateralDUSDAmount, paybackAmount)
        }, dispatch, () => {
          onTransactionBroadcast(isOnPage, navigation.dispatch)
        }, () => {
          dispatch(fetchVaults({
            address,
            client
          }))
        }, logger)
    }
  }

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  const onPaybackDUSD = (): void => {
    const amount = BigNumber.min(collateralDUSDAmount, paybackAmount)
    setBottomSheetScreen([{
      stackScreenName: 'Quick Bid',
      option: {
        header: () => null,
        headerBackTitleVisible: false
      },
      component: PaybackDUSD({
        onSubmit,
        paybackAmount: amount,
        paybackValue: new BigNumber(amount).multipliedBy(activePrice),
        onCloseButtonPress: dismissModal
      })
    }])
    expandModal()
  }
  return (
    <IconButton
      iconLabel={translate('components/VaultDetailsLoansTab', 'PAYBACK WITH DUSD COLLATERAL')}
      style={tailwind('mb-2 p-2 w-full justify-center flex-1')}
      testID='loan_card_DUSD_payback_dusd_loan'
      onPress={onPaybackDUSD}
    />
  )
}

function ActionButtons ({
  vault,
  loanToken,
  canUseOperations,
  testID
}: {
  vault: LoanVaultActive
  loanToken: LoanVaultTokenAmount
  canUseOperations: boolean
  testID: string }): JSX.Element {
  const navigation = useNavigation<NavigationProp<LoanParamList>>()

  return (
    <View style={tailwind('flex flex-row justify-between w-full')}>
      <IconButton
        disabled={!canUseOperations}
        iconLabel={translate('components/VaultDetailsLoansTab', 'PAYBACK LOAN')}
        style={tailwind('mr-1 mb-2 p-2 w-1/2 justify-center flex-1')}
        testID={`${testID}_payback_loan`}
        onPress={() => {
          navigation.navigate({
            name: 'PaybackLoanScreen',
            merge: true,
            params: {
              vault,
              loanTokenAmount: loanToken
            }
          })
        }}
      />
      <IconButton
        disabled={!canUseOperations || vault.state === LoanVaultState.FROZEN}
        iconLabel={translate('components/VaultDetailsLoansTab', 'BORROW MORE')}
        style={tailwind('ml-1 mb-2 p-2 w-1/2 justify-center flex-1')}
        testID={`${testID}_borrow_more`}
        onPress={() => {
          navigation.navigate({
            name: 'BorrowMoreScreen',
            merge: true,
            params: {
              vault,
              loanTokenAmount: loanToken
            }
          })
        }}
      />
    </View>
  )
}

const PaybackDUSD = ({ onCloseButtonPress, paybackAmount, paybackValue, onSubmit }: {
  onCloseButtonPress: () => void
  paybackAmount: BigNumber
  paybackValue: BigNumber
  onSubmit: () => Promise<void>
}): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const {
    hasPendingJob,
    hasPendingBroadcastJob
  } = useSignBidAndSend()
  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('h-full flex')}
    >
      <View style={tailwind('px-4 pt-4')}>
        <View style={tailwind('font-medium w-full mb-2 items-end')}>
          <TouchableOpacity
            onPress={onCloseButtonPress}
            testID='payback_close_button'
          >
            <ThemedIcon
              size={24}
              name='close'
              iconType='MaterialIcons'
              dark={tailwind('text-white text-opacity-70')}
              light={tailwind('text-gray-700')}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ThemedScrollView
        light={tailwind('bg-white')}
        dark={tailwind('bg-gray-800')}
        contentContainerStyle={tailwind('pb-8')}
      >
        <View style={tailwind('px-4')}>
          <View>
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('text-xs text-center mb-1')}
            >
              {translate('components/QuickBid', 'Paying loan amount of')}
            </ThemedText>
            <NumberFormat
              value={paybackAmount.toFixed(8)}
              thousandSeparator
              displayType='text'
              renderText={value =>
                <ThemedText
                  dark={tailwind('text-gray-50')}
                  light={tailwind('text-gray-900')}
                  style={tailwind('text-lg flex-wrap font-medium text-center')}
                >
                  {value}
                </ThemedText>}
            />
            <NumberFormat
              decimalScale={8}
              prefix='≈ $'
              displayType='text'
              renderText={value =>
                <View style={tailwind('flex flex-row justify-center flex-wrap items-center')}>
                  <ThemedText
                    dark={tailwind('text-gray-50')}
                    light={tailwind('text-gray-900')}
                    style={tailwind('text-2xs flex-wrap text-center')}
                  >
                    {value}
                  </ThemedText>
                  <IconTooltip />
                </View>}
              thousandSeparator
              value={getPrecisedTokenValue(paybackValue)}
            />
          </View>
          <Text
            style={tailwind('text-sm text-center mt-6 text-orange-v2')}
          >
            {translate('components/PaybackDUSD', 'Are you sure you want to payback your DUSD loan with all available DUSD collateral in this vault?')}
          </Text>
          <View style={tailwind('-mt-3 -mx-4')}>
            <SubmitButtonGroup
              isDisabled={hasPendingJob || hasPendingBroadcastJob}
              label={translate('components/PaybackDUSD', 'Payback with DUSD collateral')}
              processingLabel={translate('components/PaybackDUSD', 'Payback with DUSD collateral')}
              onSubmit={onSubmit}
              title='payback_loan_continue'
              isProcessing={hasPendingJob || hasPendingBroadcastJob}
              displayCancelBtn={false}
            />
          </View>
        </View>
      </ThemedScrollView>
    </ThemedView>
  )
})

async function paybackLoanToken ({
  vaultId,
  amount,
  loanToken
}: {
  vaultId: string
  amount: BigNumber
  loanToken: LoanVaultTokenAmount
}, dispatch: Dispatch<any>, onBroadcast: () => void, onConfirmation: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()
      // TODO (Harsh) update api for payback loan
      const signed = await builder.loans.paybackLoan({
          vaultId: vaultId,
          from: script,
          tokenAmounts: [{
            token: +loanToken.id,
            amount: new BigNumber(0)
          }]
        }, script)
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/ConfirmPaybackLoanScreen', 'Paying loan amount of'),
      description: translate('screens/ConfirmPaybackLoanScreen', 'Paying {{amountToPayInPaymentToken}} {{paymentSymbol}} as loan payment.', {
        amountToPayInPaymentToken: amount.toFixed(8),
        paymentSymbol: loanToken.displaySymbol
      }),
      drawerMessages: {
        preparing: translate('screens/OceanInterface', 'Preparing loan payment…'),
        waiting: translate('screens/OceanInterface', 'Paying back loan amount of {{amount}} DUSD', { amount }),
        complete: translate('screens/OceanInterface', 'Paid loan amount of {{amount}} DUSD', { amount })
      },
      onBroadcast,
      onConfirmation
    }))
  } catch (e) {
    logger.error(e)
  }
}
