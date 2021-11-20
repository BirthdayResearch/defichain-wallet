import React, { useState } from 'react'
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
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { useVaultStatus, VaultStatusTag } from '@screens/AppNavigator/screens/Loans/components/VaultStatusTag'
import { useCollateralizationRatioColor } from '@screens/AppNavigator/screens/Loans/hooks/CollateralizationRatio'
import { WalletTextInput } from '@components/WalletTextInput'
import { InputHelperText } from '@components/InputHelperText'

type Props = StackScreenProps<LoanParamList, 'PaybackLoanScreen'>

export function PaybackLoanScreen ({
  navigation,
  route
}: Props): JSX.Element {
  const {
    loanToken,
    vault
  } = route.params
  const [amountToPay, setAmountToPay] = useState(loanToken.amount)
  return (
    <ThemedScrollView>
      <View style={tailwind('px-4')}>
        <ThemedSectionTitle
          text={translate('screens/PaybackLoanScreen', 'YOU ARE PAYING FOR LOAN')}
        />
        <LoanTokenInput
          loanTokenId={loanToken.id}
          displaySymbol={loanToken.displaySymbol}
          price={loanToken.activePrice}
          outstandingBalance={new BigNumber(loanToken.amount)}
        />
        <ThemedSectionTitle
          text={translate('screens/PaybackLoanScreen', 'VAULT IN USE')}
        />
        <View>
          <VaultInput vault={vault} />
        </View>
        <View style={tailwind('mt-2')}>
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
            label={`${translate('components/PaybackLoanScreen', 'Available')}: `}
            content='1'
            suffix={` ${loanToken.displaySymbol}`}
            styleProps={tailwind('font-medium')}
          />
        </View>
      </View>
    </ThemedScrollView>
  )
}

interface LoanTokenInputProps {
  loanTokenId: string
  displaySymbol: string
  price?: ActivePrice
  outstandingBalance: BigNumber
}

function LoanTokenInput (props: LoanTokenInputProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border p-4 flex flex-col rounded-lg')}
    >
      <View style={tailwind('flex flex-row flex-1 items-center mb-2')}>
        <SymbolIcon
          symbol={props.displaySymbol} styleProps={{
          width: 24,
          height: 24
        }}
        />
        <ThemedText style={tailwind('ml-2 text-sm font-medium')}>{props.displaySymbol}</ThemedText>
      </View>
      <View style={tailwind('flex flex-row items-center justify-between mb-1 mt-2')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('screens/PaybackLoanScreen', 'Outstanding balance')}
        </ThemedText>
        <NumberFormat
          value={new BigNumber(props.outstandingBalance).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix={` ${props.displaySymbol}`}
          displayType='text'
          renderText={(value) =>
            <ThemedText style={tailwind('font-medium')}>
              {value}
            </ThemedText>}
        />
      </View>
    </ThemedView>
  )
}

interface VaultInputProps {
  vault: LoanVaultActive
}

function VaultInput ({ vault }: VaultInputProps): JSX.Element {
  const vaultState = useVaultStatus(vault.state, new BigNumber(vault.collateralRatio), new BigNumber(vault.loanScheme.minColRatio), new BigNumber(vault.loanValue))
  const colors = useCollateralizationRatioColor({
    colRatio: new BigNumber(vault.collateralRatio),
    minColRatio: new BigNumber(vault.loanScheme.minColRatio),
    totalLoanAmount: new BigNumber(vault.loanValue)
  })
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('border p-4 flex flex-col rounded-lg mb-4')}
    >
      <View style={tailwind('flex flex-row flex-1 justify-between items-center mb-2')}>
        <ThemedText
          numberOfLines={1}
          ellipsizeMode='middle'
          style={tailwind('mr-2 w-56 flex-shrink text-sm font-medium')}
        >{vault.vaultId}
        </ThemedText>
        <VaultStatusTag status={vaultState} />
      </View>
      <View style={tailwind('flex flex-row items-center justify-between mb-1 mt-2')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('screens/PaybackLoanScreen', 'Collateralization ratio')}
        </ThemedText>
        <NumberFormat
          value={new BigNumber(vault.collateralRatio).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix='%'
          displayType='text'
          renderText={(value) =>
            <ThemedText light={colors.light} dark={colors.dark} style={tailwind('font-medium')}>
              {value}
            </ThemedText>}
        />
      </View>
      <View style={tailwind('flex flex-row items-center justify-between mb-1')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('screens/PaybackLoanScreen', 'Min. collateralization ratio')}
        </ThemedText>
        <NumberFormat
          value={new BigNumber(vault.loanScheme.minColRatio).toFixed(2)}
          decimalScale={2}
          thousandSeparator
          suffix='%'
          displayType='text'
          renderText={(value) =>
            <ThemedText light={colors.light} dark={colors.dark} style={tailwind('font-medium')}>
              {value}
            </ThemedText>}
        />
      </View>
    </ThemedView>
  )
}
