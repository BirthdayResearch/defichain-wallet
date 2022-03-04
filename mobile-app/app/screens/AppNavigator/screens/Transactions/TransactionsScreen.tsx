import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { RefreshControl, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { EmptyTransaction } from './EmptyTransaction'
import { activitiesToViewModel, VMTransaction } from './screens/stateProcessor'
import { TransactionsParamList } from './TransactionsNavigator'

type LoadingState = 'idle' | 'loading' | 'loadingMore' | 'success' | 'background' | 'error'

export function formatBlockTime (date: number): string {
  return dayjs(date * 1000).format('lll')
}

export function TransactionsScreen (): JSX.Element {
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const { isLight } = useThemeContext()
  const navigation = useNavigation<NavigationProp<TransactionsParamList>>()
  const blocks = useSelector((state: RootState) => state.block.count)
  const [transactions, setTransactions] = useState<VMTransaction[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [loadMoreToken, setLoadMoreToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    // onload
    if (loadingState === 'idle') {
      setLoadingState('loading')
      loadData()
    }
  }, [])

  useEffect(() => {
    // background update
    if (loadingState === 'success' || loadingState === 'error') {
      setLoadingState('background')
      loadData()
    }
  }, [address, blocks])

  const loadData = (loadMoreToken?: string | undefined): void => {
    client.address.listTransaction(address, undefined, loadMoreToken)
      .then(async addActivities => {
        if (typeof loadMoreToken === 'string') {
          setTransactions(transactions.concat(activitiesToViewModel(addActivities, isLight)))
        } else {
          setTransactions(activitiesToViewModel(addActivities, isLight))
        }

        setLoadMoreToken(addActivities.nextToken)
        setLoadingState('success')
      }).catch(() => {
      setLoadingState('error')
    })
  }

  const onLoadMore = (): void => {
    if (loadingState === 'success' || loadingState === 'error') {
      loadData(loadMoreToken)
    }
  }

  const onRefresh = (): void => {
    setLoadingState('loadingMore')
    loadData(loadMoreToken)
  }

  if (transactions.length === 0 &&
    (loadingState === 'success' || loadingState === 'background')) {
    return (
      <EmptyTransaction
        handleRefresh={loadData}
        loadingStatus={loadingState}
        navigation={navigation}
      />
    )
  }

  if (loadingState === 'loading') {
    return (
      <SkeletonLoader
        row={3}
        screen={SkeletonLoaderScreen.Transaction}
      />
    )
  }
  // TODO(kyleleow): render error screen
  return (
    <ThemedFlatList
      ListFooterComponent={typeof loadMoreToken === 'string' ? <LoadMore onPress={onLoadMore} /> : undefined}
      data={transactions}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={loadingState === 'loadingMore'}
        />
      }
      renderItem={
        ({
          item,
          index
        }: { item: VMTransaction, index: number }) => (
          <TransactionRow
            index={index}
            item={item}
            navigation={navigation}
          />
        )
      }
      style={tailwind('w-full')}
      testID='transactions_screen_list'
    />
  )
}

function TransactionRow ({
  navigation,
  item,
  index
}: { navigation: NavigationProp<TransactionsParamList>, item: VMTransaction, index: number }): JSX.Element {
  const {
    color,
    iconName,
    amount,
    desc,
    medianTime,
    token
  } = item

  const rowId = `transaction_row_${index}`
  return (
    <ThemedTouchableOpacity
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      key={item.id}
      light={tailwind('bg-white border-b border-gray-200')}
      onPress={() => {
        navigation.navigate({
          name: 'TransactionDetail',
          params: { tx: item },
          merge: true
        })
      }}
      style={tailwind('flex-row w-full h-16 p-2 items-center')}
      testID={rowId}
    >
      <View style={tailwind('w-8 justify-center items-center')}>
        <MaterialIcons
          color={color}
          name={iconName}
          size={24}
        />
      </View>

      <View style={tailwind('flex-1 flex-row justify-center items-center')}>
        <View style={tailwind('flex-auto flex-col ml-3 justify-center')}>
          <ThemedText style={tailwind('font-medium')}>
            {translate('screens/TransactionsScreen', desc)}
          </ThemedText>

          <ThemedText
            style={tailwind('text-xs text-gray-600')}
          >
            {formatBlockTime(medianTime)}
          </ThemedText>
        </View>

        <View style={tailwind('flex-row ml-3 w-32 justify-end items-center')}>
          <NumberFormat
            decimalScale={8}
            displayType='text'
            renderText={(value) => (
              <ThemedText
                ellipsizeMode='tail'
                numberOfLines={1}
                style={{ color }}
              >
                {value}
              </ThemedText>
            )}
            thousandSeparator
            value={amount}
          />

          <View style={tailwind('ml-2 items-start')}>
            <ThemedText style={tailwind('flex-shrink font-medium text-gray-600')}>
              {token}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={tailwind('w-8 justify-center items-center')}>
        <ThemedIcon
          iconType='MaterialIcons'
          name='chevron-right'
          size={24}
          style={tailwind('opacity-60')}
        />
      </View>
    </ThemedTouchableOpacity>
  )
}

function LoadMore ({ onPress }: { onPress: () => void }): JSX.Element | null {
  return (
    <View style={tailwind('flex-1 items-center justify-center w-full m-1')}>
      <TouchableOpacity
        onPress={onPress}
        style={tailwind('p-2')}
        testID='transactions_list_loadmore'
      >
        <ThemedText
          dark={tailwind('text-darkprimary-500')}
          light={tailwind('text-primary-500')}
        >
          {translate('screens/TransactionsScreen', 'LOAD MORE')}
        </ThemedText>
      </TouchableOpacity>
    </View>
  )
}
