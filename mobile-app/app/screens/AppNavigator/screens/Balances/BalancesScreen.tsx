import { IconButton } from '@components/IconButton'
import { getNativeIcon } from '@components/icons/assets'
import { View } from '@components/index'
import {
  ThemedFlatList,
  ThemedIcon,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { useWalletContext } from '@contexts/WalletContext'
import { useWalletPersistenceContext } from '@contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '@contexts/WhaleContext'
import { fetchTokens, useTokensAPI } from '@hooks/wallet/TokensAPI'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from '@store'
import { ocean } from '@store/ocean'
import { DFITokenSelector, DFIUtxoSelector, WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import DFIBackground from '@assets/images/DFI_balance_background.png'
import DFIBackgroundDark from '@assets/images/DFI_balance_background_dark.png'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { ImageBackground, RefreshControl } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { BalanceParamList } from './BalancesNavigator'
import { useThemeContext } from '@contexts/ThemeProvider'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export function BalancesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const [refreshing, setRefreshing] = useState(false)
  const dispatch = useDispatch()
  const { wallets } = useWalletPersistenceContext()
  const { isLight } = useThemeContext()

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height, wallets])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchTokens(client, address, dispatch)
    setRefreshing(false)
  }, [address, client, dispatch])

  const tokens = useTokensAPI()
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const onConvertPress = (): void => {
    navigation.navigate({
      name: 'Convert',
      params: { mode: 'utxosToAccount' },
      merge: true
    })
  }
  const onSendPress = (): void => {
    navigation.navigate({
      name: 'Send',
      params: { token: DFIUtxo },
      merge: true
    })
  }

  return (
    <ThemedFlatList
      ItemSeparatorComponent={() => (
        <ThemedView
          dark={tailwind('bg-gray-700')}
          light={tailwind('bg-gray-100')}
          style={tailwind('h-px')}
        />
      )}
      ListHeaderComponent={(
        <>
          <DFIBalanceCard utxo={DFIUtxo} token={DFIToken} isLight={isLight} onConvertPress={onConvertPress} onSendPress={onSendPress} />
          <ThemedSectionTitle
            testID='balances_title'
            text={translate('screens/BalancesScreen', 'PORTFOLIO')}
          />
        </>
      )}
      data={tokens}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      }
      renderItem={({ item }) => {
        if (item.id === '0_utxo' || item.id === '0') {
          return (<></>)
        }

        return (
          <BalanceItemRow
            key={item.symbol}
            onPress={() => navigation.navigate({ name: 'TokenDetail', params: { token: item }, merge: true })}
            token={item}
          />
        )
      }}
      testID='balances_list'
    />
  )
}

function BalanceItemRow ({
  token,
  onPress
}: { token: WalletToken, onPress: () => void }): JSX.Element {
  const Icon = getNativeIcon(token.avatarSymbol)
  const testID = `balances_row_${token.id}`
  return (
    <ThemedTouchableOpacity
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      onPress={onPress}
      style={tailwind('py-4 pl-4 pr-2 flex-row justify-between items-center')}
      testID={testID}
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <Icon testID={`${testID}_icon`} />

        <View style={tailwind('mx-3 flex-auto')}>
          <ThemedText
            dark={tailwind('text-gray-200')}
            light={tailwind('text-black')}
            style={tailwind('font-medium')}
            testID={`${testID}_symbol`}
          >
            {token.displaySymbol}
          </ThemedText>

          <ThemedText
            dark={tailwind('text-gray-400')}
            ellipsizeMode='tail'
            light={tailwind('text-gray-600')}
            numberOfLines={1}
            style={tailwind('text-sm font-medium text-gray-600')}
            testID={`${testID}_name`}
          >
            {token.name}
          </ThemedText>
        </View>

        <View style={tailwind('flex-row items-center')}>
          <NumberFormat
            decimalScale={8}
            displayType='text'
            renderText={(value) =>
              <>
                <ThemedText
                  dark={tailwind('text-gray-200')}
                  light={tailwind('text-black')}
                  style={tailwind('mr-2 flex-wrap')}
                  testID={`${testID}_amount`}
                >
                  {value}
                </ThemedText>

                <ThemedIcon
                  dark={tailwind('text-gray-200')}
                  iconType='MaterialIcons'
                  light={tailwind('text-black')}
                  name='chevron-right'
                  size={24}
                />
              </>}
            thousandSeparator
            value={new BigNumber(token.amount).toFixed(8)}
          />
        </View>
      </View>
    </ThemedTouchableOpacity>
  )
}

interface DFIBalanceCardProps {
  utxo: WalletToken
  token: WalletToken
  onConvertPress: () => void
  onSendPress: () => void
  isLight: boolean
}

function DFIBalanceCard (props: DFIBalanceCardProps): JSX.Element {
  const DFIIcon = getNativeIcon('_UTXO')
  const totalDFI = new BigNumber(props.utxo.amount).plus(new BigNumber(props.token.amount)).toFixed(8)

  return (
    <ThemedView
      light={tailwind('bg-white border-gray-100')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('mx-2 mt-4 rounded-lg flex-1')}
      testID='dfi_balance_card'
    >
      <ImageBackground source={props.isLight ? DFIBackground : DFIBackgroundDark} style={tailwind('flex-1 rounded-lg overflow-hidden')} resizeMode='cover' resizeMethod='scale'>
        <View style={tailwind('flex-col flex-1 mx-4 mt-5 mb-4')}>
          <View style={tailwind('flex-row pb-3 items-center')}>
            <DFIIcon width={24} height={24} style={tailwind('mr-2')} />
            <ThemedText style={tailwind('pr-9 text-lg font-bold')} testID='total_dfi_label'>DFI</ThemedText>
            <ThemedText testID='total_dfi_amount'>{totalDFI} DFI</ThemedText>
          </View>

          <View style={tailwind('flex-row pb-1.5')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('pr-16 text-sm')}
              testID='dfi_utxo_label'
            >
              UTXO
            </ThemedText>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('text-sm')}
              testID='dfi_utxo_amount'
            >
              {new BigNumber(props.utxo.amount).toFixed(8)}
            </ThemedText>
          </View>

          <View style={tailwind('flex-row items-center flex-1')}>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('pr-14 text-sm')}
              testID='dfi_token_label'
            >
              Token
            </ThemedText>
            <ThemedText
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              style={tailwind('pl-1.5 text-sm')}
              testID='dfi_token_amount'
            >
              {new BigNumber(props.token.amount).toFixed(8)}
            </ThemedText>

            <View style={tailwind('flex-row flex-grow justify-end')}>
              <IconButton
                iconName='swap-vert'
                iconSize={24}
                iconType='MaterialIcons'
                onPress={props.onConvertPress}
                testID='convert_dfi_button'
                style={tailwind('mr-2')}
              />
              <IconButton
                iconName='arrow-upward'
                iconSize={24}
                iconType='MaterialIcons'
                onPress={props.onSendPress}
                testID='send_dfi_button'
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </ThemedView>
  )
}
