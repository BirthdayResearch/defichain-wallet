import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { LoanCardOptions, LoanCards } from '../components/LoanCards'
import { StackScreenProps } from '@react-navigation/stack'
import { LoanParamList } from '../LoansNavigator'
import { debounce } from 'lodash'
import { Platform, TouchableOpacity, View } from 'react-native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SearchInput } from '@components/SearchInput'

type Props = StackScreenProps<LoanParamList, 'ChooseLoanTokenScreen'>

export function ChooseLoanTokenScreen ({ navigation }: Props): JSX.Element {
  const loans: LoanCardOptions[] = [
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'DFI',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'dETH',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'dLTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'dBCH',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'BTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'BTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'BTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345')
    },
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345')
    }
  ]
  const [filteredLoans, setFilteredLoans] = useState<LoanCardOptions[]>(loans)
  const [showSeachInput, setShowSearchInput] = useState(false)
  const [searchString, setSearchString] = useState('')

  const handleFilter = useCallback(
    debounce((searchString: string) => {
      setFilteredLoans(loans.filter(loan =>
        loan.loanName.toLowerCase().includes(searchString.toLowerCase().trim())
      ))
    }, 1000)
  , [])

  useEffect(() => {
    handleFilter(searchString)
  }, [searchString])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => (
        <HeaderSearchIcon onPress={() => setShowSearchInput(true)} />
      )
    })
  }, [navigation])

  useEffect(() => {
    if (showSeachInput) {
      navigation.setOptions({
        header: (): JSX.Element => (
          <HeaderSearchInput
            searchString={searchString}
            onClearInput={() => setSearchString('')}
            onChangeInput={(text: string) => setSearchString(text)}
            onCancelPress={() => setShowSearchInput(false)}
          />
        )
      })
    } else {
      navigation.setOptions({
        header: undefined
      })
    }
  }, [showSeachInput, searchString])

  return (
    <ThemedView style={tailwind('flex-1')}>
      <LoanCards
        testID='loans_cards'
        loans={filteredLoans}
        onPress={(loan: LoanCardOptions) => {
          navigation.navigate({
            name: 'BorrowLoanTokenScreen',
            params: {
              loan
            },
            merge: true
          })
        }}
      />
    </ThemedView>
  )
}

function HeaderSearchIcon (props: {onPress: () => void}): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={tailwind('pr-4')}
    >
      <ThemedIcon
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        name='search'
        size={24}
      />
    </TouchableOpacity>
  )
}

interface HeaderSearchInputProps {
  searchString: string
  onClearInput: () => void
  onChangeInput: (text: string) => void
  onCancelPress: () => void
}

function HeaderSearchInput (props: HeaderSearchInputProps): JSX.Element {
  const safeAreaInsets = useSafeAreaInsets()
  return (
    <ThemedView
      light={tailwind('bg-white border-gray-200')}
      dark={tailwind('bg-gray-800 border-gray-700')}
      style={[
        tailwind('flex flex-row items-center pb-2 px-4'),
        {
          paddingTop: Platform.OS === 'android' ? safeAreaInsets.top + 8 : safeAreaInsets.top - 4
        }
      ]}
    >
      <SearchInput
        value={props.searchString}
        placeholder={translate('screens/ChooseLoanTokenScreen', 'Search for loans')}
        autoFocus
        onClearInput={props.onClearInput}
        onChangeText={props.onChangeInput}
      />
      <View style={tailwind('w-16 flex justify-center ml-2')}>
        <TouchableOpacity onPress={props.onCancelPress}>
          <ThemedText
            light={tailwind('text-primary-500')}
            dark={tailwind('text-darkprimary-500')}
            style={tailwind('font-medium')}
          >
            {translate('screens/ChooseLoanTokenScreen', 'CANCEL')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}
