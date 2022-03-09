import { FeeInfoRow } from '@components/FeeInfoRow'
import { NumberRow } from '@components/NumberRow'
import { TextRow } from '@components/TextRow'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import BigNumber from 'bignumber.js'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Dispatch, useEffect, useState } from 'react'
import { View } from 'react-native'
import { LoanParamList } from '../LoansNavigator'
import { SymbolIcon } from '@components/SymbolIcon'
import NumberFormat from 'react-number-format'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { firstTransactionSelector, hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { CollateralItem } from '@screens/AppNavigator/screens/Loans/screens/EditCollateralScreen'
import { useCollateralPrice } from '@screens/AppNavigator/screens/Loans/hooks/CollateralPrice'
import { onTransactionBroadcast } from '@api/transaction/transaction_commands'
import { fetchVaults } from '@store/loans'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { ConversionTag } from '@components/ConversionTag'
import { ConversionParam } from '@screens/AppNavigator/screens/Balances/BalancesNavigator'
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { WalletAddressRow } from '@components/WalletAddressRow'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'

type Props = StackScreenProps<LoanParamList, 'ConfirmEditCollateralScreen'>

export function ConfirmEditCollateralScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const {
    vault,
    token,
    amount,
    fee,
    isAdd,
    collateralItem,
    conversion
  } = route.params
  const { address } = useWalletContext()
  const client = useWhaleApiClient()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const currentBroadcastJob = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const dispatch = useDispatch()
  const logger = useLogger()

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  function onCancel (): void {
    navigation.navigate({
      name: 'EditCollateralScreen',
      params: {
        vaultId: vault.vaultId
      },
      merge: true
    })
  }

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    await modifyCollateral({
      vaultId: vault.vaultId,
      token,
      tokenAmount: amount,
      isAdd
    }, dispatch, logger, () => {
      onTransactionBroadcast(isOnPage, navigation.dispatch, 1)
    }, () => {
      dispatch(fetchVaults({
        address,
        client
      }))
    })
  }

  function getSubmitLabel (): string {
    if (hasPendingBroadcastJob && currentBroadcastJob !== undefined && currentBroadcastJob.submitButtonLabel !== undefined) {
      return currentBroadcastJob.submitButtonLabel
    }
    if (hasPendingBroadcastJob || hasPendingJob) {
      return isAdd ? 'ADDING' : 'REMOVING'
    }
    return isAdd ? 'CONFIRM ADD COLLATERAL' : 'CONFIRM REMOVE COLLATERAL'
  }

  return (
    <ThemedScrollView>
      <SummaryHeader vaultId={vault.vaultId} isAdd={isAdd} conversion={conversion} />
      <CollateralSection
        totalCollateralValue={new BigNumber(vault.collateralValue)}
        collateralItem={collateralItem}
        token={token}
        amount={amount}
        fee={fee}
        conversion={conversion}
        isAdd={isAdd}
        vault={vault}
      />
      <SubmitButtonGroup
        isDisabled={hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmEditCollateralScreen', `CONFIRM ${isAdd ? 'ADD' : 'REMOVE'} COLLATERAL`)}
        isProcessing={hasPendingJob || hasPendingBroadcastJob}
        processingLabel={translate('screens/ConfirmEditCollateralScreen', getSubmitLabel())}
        onCancel={onCancel}
        onSubmit={onSubmit}
        displayCancelBtn
        title='confirm_edit_collateral'
      />
    </ThemedScrollView>
  )
}

function SummaryHeader (props: { vaultId: string, isAdd: boolean, conversion?: ConversionParam }): JSX.Element {
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
        testID='edit_collateral_confirm_title'
      >
        {translate('screens/ConfirmEditCollateralScreen', props.isAdd ? 'You are adding collateral to' : 'You are removing collateral from')}
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
          testID='edit_collateral_confirm_vault_id'
        >
          {props.vaultId}
        </ThemedText>
      </View>
      {props.conversion?.isConversionRequired === true && <ConversionTag />}
    </ThemedView>
  )
}

interface CollateralSectionProps {
  collateralItem: CollateralItem
  token: TokenData
  amount: BigNumber
  totalCollateralValue: BigNumber
  conversion?: ConversionParam
  isAdd: boolean
  fee: BigNumber
  vault: LoanVaultActive
}

function CollateralSection (props: CollateralSectionProps): JSX.Element {
  const currentBalance = props.vault?.collateralAmounts?.find((c) => c.id === props.token.id)?.amount ?? '0'
  const amount = props.isAdd ? props.amount.plus(currentBalance) : BigNumber.max(0, new BigNumber(currentBalance).minus(props.amount))
  const initialPrices = useCollateralPrice(props.amount, props.collateralItem, props.totalCollateralValue)
  const totalCollateralValue = props.isAdd ? props.totalCollateralValue.plus(initialPrices.collateralPrice) : props.totalCollateralValue.minus(initialPrices.collateralPrice)
  const prices = useCollateralPrice(amount, props.collateralItem, totalCollateralValue)
  return (
    <>
      <ThemedSectionTitle
        text={translate('screens/ConfirmEditCollateralScreen', 'TRANSACTION DETAILS')}
      />
      <TextRow
        lhs={translate('screens/ConfirmEditCollateralScreen', 'Transaction type')}
        rhs={{
          value: props.conversion?.isConversionRequired === true
            ? translate('screens/ConfirmEditCollateralScreen', `Convert & ${props.isAdd ? 'add collateral' : 'remove collateral'}`)
            : translate('screens/ConfirmEditCollateralScreen', `${props.isAdd ? 'Add Collateral' : 'Remove Collateral'}`),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <WalletAddressRow />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={props.fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />
      <TextRow
        lhs={translate('screens/ConfirmEditCollateralScreen', 'Token')}
        rhs={{
          value: props.token.displaySymbol,
          testID: 'text_token_id'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/ConfirmEditCollateralScreen', 'Collateralization factor')}
        rhs={{
          value: prices.collateralFactor.multipliedBy(100).toFixed(2),
          testID: 'collateral_factor',
          suffixType: 'text',
          suffix: '%',
          style: tailwind('ml-0')
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmEditCollateralScreen', 'Collateral amount (USD)')}
        rhs={{
          value: props.amount.toFixed(8),
          testID: 'collateral_amount',
          suffixType: 'text',
          suffix: props.token.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/ConfirmEditCollateralScreen', 'Collateral value (USD)')}
        rhs={{
          value: getUSDPrecisedPrice(prices.collateralPrice),
          testID: 'collateral_value',
          prefix: '$'
        }}
      />
      <VaultProportionRow
        lhs={translate('screens/ConfirmEditCollateralScreen', 'Vault %')}
        tokenId={props.token.displaySymbol}
        proportion={prices.vaultShare}
      />
    </>
  )
}

function VaultProportionRow (props: { lhs: string, tokenId: string, proportion: BigNumber }): JSX.Element {
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
        {props.proportion.isNaN()
          ? (
            <ThemedText
              light={tailwind('text-gray-900')}
              dark={tailwind('text-gray-50')}
              style={tailwind('text-xs font-medium ml-1')}
              testID='edit_collateral_confirm_vault_share'
            >{translate('screens/ConfirmEditCollateralScreen', 'N/A')}
            </ThemedText>
          )
          : (
            <NumberFormat
              value={props.proportion.toFixed(2)}
              decimalScale={2}
              displayType='text'
              thousandSeparator
              suffix='%'
              renderText={value =>
                <ThemedText
                  light={tailwind('text-gray-700')}
                  dark={tailwind('text-gray-300')}
                  style={tailwind('text-xs font-medium ml-1')}
                  testID='edit_collateral_confirm_vault_share'
                >
                  {value}
                </ThemedText>}
            />)}
      </ThemedView>
    </ThemedView>
  )
}

interface ModifyCollateralForm {
  vaultId: string
  tokenAmount: BigNumber
  token: TokenData
  isAdd: boolean
}

async function modifyCollateral ({
  vaultId,
  tokenAmount,
  token,
  isAdd
}: ModifyCollateralForm, dispatch: Dispatch<any>, logger: NativeLoggingProps, onBroadcast: () => void, onConfirmation: () => void): Promise<void> {
  try {
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const script = await account.getScript()
      const builder = account.withTransactionBuilder()

      const signed: TransactionSegWit = isAdd
        ? await builder.loans.depositToVault({
          vaultId,
          from: script,
          tokenAmount: {
            token: +token.id,
            amount: tokenAmount
          }
        }, script)
        : await builder.loans.withdrawFromVault({
          vaultId,
          tokenAmount: {
            token: +token.id,
            amount: tokenAmount
          },
          to: script
        }, script)
      return new CTransactionSegWit(signed)
    }

    dispatch(transactionQueue.actions.push({
      sign: signer,
      title: translate('screens/EditCollateralScreen', isAdd ? 'Adding collateral' : 'Removing collateral'),
      description: translate('screens/EditCollateralScreen', isAdd
        ? 'Adding {{amount}} {{symbol}} as collateral'
        : 'Removing {{amount}} {{symbol}} collateral from vault', {
        amount: tokenAmount.toFixed(8),
        symbol: token.displaySymbol
      }),
      onConfirmation,
      onBroadcast
    }))
  } catch (e) {
    logger.error(e)
  }
}
