import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import { VaultInfo } from '../../components/VaultInfo'
import { IconButton } from '@components/IconButton'
import { translate } from '@translations'
import { TouchableOpacity } from 'react-native'

interface ActiveLoan {
  loanId: string
  loanName: string
  borrowedTokens: BigNumber
  interest: BigNumber
  amountPayable: BigNumber
  pricePerToken: BigNumber
}

export function ActiveLoans (): JSX.Element {
  const activeLoans = [
    {
      loanId: 'BTC',
      loanName: 'dBTC',
      borrowedTokens: new BigNumber('30000'),
      interest: new BigNumber('300'),
      amountPayable: new BigNumber('20300'),
      pricePerToken: new BigNumber('1234.32134')
    },
    {
      loanId: 'DFI',
      loanName: 'DFI',
      borrowedTokens: new BigNumber('30000'),
      interest: new BigNumber('300'),
      amountPayable: new BigNumber('20300'),
      pricePerToken: new BigNumber('1234.32134')
    },
    {
      loanId: 'dDOGE',
      loanName: 'dDOGE',
      borrowedTokens: new BigNumber('30000'),
      interest: new BigNumber('300'),
      amountPayable: new BigNumber('20300'),
      pricePerToken: new BigNumber('1234.32134')
    }
  ]

  return (
    <ThemedView
      style={tailwind('p-4')}
    >
      {activeLoans.map(loan => (
        <ActiveLoanCard key={loan.loanId} {...loan} />
      ))}
    </ThemedView>
  )
}

function ActiveLoanCard (props: ActiveLoan): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={tailwind('p-4 mb-2 border rounded')}
    >
      <View style={tailwind('flex flex-row items-center')}>
        <SymbolIcon symbol={props.loanId} styleProps={{ width: 32, height: 32 }} />
        <ThemedText
          style={tailwind('font-medium ml-2')}
        >
          {props.loanName}
        </ThemedText>
      </View>
      <View style={tailwind('flex flex-row flex-wrap -mb-2 mt-4')}>
        <VaultInfo label='Borrowed tokens' value={props.borrowedTokens} valueType='NUMBER' valueStyleProps={tailwind('font-normal')} />
        <VaultInfo label='Interest amount (1.5%)' value={props.interest} valueType='NUMBER' valueStyleProps={tailwind('font-normal')} />
        <VaultInfo label='Amount payable' value={props.amountPayable} decimalPlace={2} valueType='NUMBER' valueStyleProps={tailwind('font-normal')} />
        <VaultInfo label='Price per token (USD)' value={props.pricePerToken} decimalPlace={2} valueType='NUMBER' valueStyleProps={tailwind('font-normal')} />
      </View>
      <ActionButtons />
    </ThemedView>
  )
}

function ActionButtons (): JSX.Element {
  return (
    <View
      style={tailwind('mt-4 -mb-2 flex flex-row justify-between')}
    >
      <View style={tailwind('flex flex-row flex-wrap flex-1')}>
        <IconButton
          iconLabel={translate('components/ActiveLoans', 'REPAY LOAN')}
          style={tailwind('mr-2 mb-2 p-2')}
          onPress={() => { /* TODO: handle repay loan on press */ }}
        />
        <IconButton
          iconLabel={translate('components/ActiveLoans', 'BORROW MORE')}
          style={tailwind('mr-2 mb-2 p-2')}
          onPress={() => { /* TODO: handle borrow more on press */ }}
        />
      </View>
      <TouchableOpacity
        style={tailwind('flex justify-end mb-4')}
        onPress={() => { /* TODO: handle ... on press */ }}
      >
        <ThemedIcon
          iconType='MaterialIcons'
          name='more-horiz'
          size={16}
          light={tailwind('text-primary-500')}
          dark={tailwind('text-darkprimary-500')}
        />
      </TouchableOpacity>

    </View>
  )
}
