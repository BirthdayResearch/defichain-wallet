import { View } from '@components'
import { Button } from '@components/Button'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React, { Dispatch, useEffect, useState } from 'react'
import NumberFormat from 'react-number-format'
import { LoanParamList } from '../LoansNavigator'
import { LoanScheme } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLoanSchemes } from '@store/loans'
import { RootState } from '@store'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { DFITokenSelector, DFIUtxoSelector } from '@store/wallet'
import { ConversionMode, dfiConversionCrafter } from '@api/transaction/dfi_converter'

type Props = StackScreenProps<LoanParamList, 'CreateVaultScreen'>

export function CreateVaultScreen ({
  navigation,
  route
}: Props): JSX.Element {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const loanSchemes: LoanScheme[] = useSelector((state: RootState) => state.loans.loanSchemes)
  const logger = useLogger()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [selectedLoanScheme, setSelectedLoanScheme] = useState<LoanScheme | undefined>(route.params?.loanScheme)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const isConversionRequired = new BigNumber(2).gt(DFIUtxo.amount)

  const onSubmit = async (): Promise<void> => {
    if (selectedLoanScheme === undefined || hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    if (isConversionRequired) {
      await constructSignedConversionAndCreateVault({
        mode: 'accountToUtxos',
        amount: new BigNumber(2).minus(DFIUtxo.amount)
      }, dispatch, () => {
        navigation.navigate({
          name: 'ConfirmCreateVaultScreen',
          params: {
            loanScheme: selectedLoanScheme,
            fee: fee,
            conversion: {
              DFIUtxo,
              DFIToken,
              isConversionRequired,
              conversionAmount: new BigNumber(2).minus(DFIUtxo.amount)
            }
          }
        })
      }, logger)
    } else {
      navigation.navigate({
        name: 'ConfirmCreateVaultScreen',
        params: {
          loanScheme: selectedLoanScheme,
          fee: fee
        }
      })
    }
  }

  useEffect(() => {
    dispatch(fetchLoanSchemes({ client }))
  }, [])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  return (
    <ThemedScrollView
      testID='create_vault_screen'
      contentContainerStyle={tailwind('py-8 px-4')}
    >
      <ThemedSectionTitle
        light={tailwind('text-gray-900')}
        dark={tailwind('text-gray-50')}
        text={translate('screens/CreateVaultScreen', 'Choose loan scheme for your vault')}
        style={tailwind('mb-2 font-semibold text-lg')}
      />
      <ThemedText
        light={tailwind('text-gray-700')}
        dark={tailwind('text-gray-200')}
        style={tailwind('mb-6 text-sm')}
      >
        {translate('screens/CreateVaultScreen', 'This sets the minimum collateral ratio and the vault’s interest rate.')}
      </ThemedText>
      <LoanSchemeOptions
        loanSchemes={loanSchemes}
        selectedLoanScheme={selectedLoanScheme}
        onLoanSchemePress={(scheme: LoanScheme) => setSelectedLoanScheme(scheme)}
      />
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-center text-xs mb-16')}
      >
        {translate('screens/CreateVaultScreen', 'Keep note of your selected collateral ratio for your vault to sustain the loans within it.')}
      </ThemedText>
      <Button
        disabled={selectedLoanScheme === undefined || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/CreateVaultScreen', 'CONTINUE')}
        onPress={onSubmit}
        margin='m-0 mb-2'
        testID='create_vault_submit_button'
      />
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-center text-xs')}
      >
        {translate('screens/CreateVaultScreen', 'Confirm your vault details in next screen')}
      </ThemedText>
    </ThemedScrollView>
  )
}

function LoanSchemeOptions (props: { loanSchemes: LoanScheme[], selectedLoanScheme?: LoanScheme, onLoanSchemePress: (scheme: LoanScheme) => void }): JSX.Element {
  return (
    <View
      style={tailwind('mb-1')}
      testID='loan_scheme_options'
    >
      {props.loanSchemes.map((scheme, index) => (
        <ThemedTouchableOpacity
          key={scheme.id}
          light={tailwind('border-gray-300 bg-white', { 'border-primary-500': props.selectedLoanScheme?.id === scheme.id })}
          dark={tailwind('border-gray-700 bg-gray-800', { 'border-darkprimary-500': props.selectedLoanScheme?.id === scheme.id })}
          style={tailwind('py-2 px-5 rounded-lg border flex flex-row items-center mb-1')}
          onPress={() => props.onLoanSchemePress(scheme)}
          testID={`loan_scheme_option_${index}`}
        >
          <ThemedView
            light={tailwind('border-gray-500', { 'border-primary-500 bg-primary-500': props.selectedLoanScheme?.id === scheme.id })}
            dark={tailwind('border-gray-400', { 'border-darkprimary-500 bg-darkprimary-500': props.selectedLoanScheme?.id === scheme.id })}
            style={tailwind('rounded-full border w-4 h-4 mr-7')}
          >
            {props.selectedLoanScheme?.id === scheme.id &&
            (
              <ThemedIcon
                iconType='MaterialIcons'
                name='check'
                size={14}
                light={tailwind('text-white')}
                dark={tailwind('text-black')}
              />
            )}

          </ThemedView>
          <LoanSchemeOptionData
            label='Min. collateral ratio'
            value={scheme.minColRatio}
            testId='min_col_ratio_value'
            suffix='%'
          />
          <LoanSchemeOptionData
            label='Interest rate'
            value={scheme.interestRate}
            testId='interest_rate_value'
            suffix={`% ${translate('screens/CreateVaultScreen', 'APR')}`}
          />
        </ThemedTouchableOpacity>
      ))}
    </View>
  )
}

function LoanSchemeOptionData (props: { label: string, value: string, testId: string, suffix?: string }): JSX.Element {
  return (
    <View style={tailwind('flex-1')}>
      <ThemedText
        light={tailwind('text-gray-400')}
        dark={tailwind('text-gray-500')}
        style={tailwind('text-xs')}
      >
        {translate('screens/CreateVaultScreen', props.label)}
      </ThemedText>
      <NumberFormat
        displayType='text'
        suffix={props.suffix}
        renderText={(value: string) => (
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            style={tailwind('text-sm font-medium')}
            testID={props.testId}
          >
            {value}
          </ThemedText>
        )}
        thousandSeparator
        value={props.value}
      />

    </View>
  )
}

async function constructSignedConversionAndCreateVault ({
  mode,
  amount
}: { mode: ConversionMode, amount: BigNumber }, dispatch: Dispatch<any>, onBroadcast: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    dispatch(transactionQueue.actions.push(dfiConversionCrafter(amount, mode, onBroadcast, 'CONVERTING')))
  } catch (e) {
    logger.error(e)
  }
}
