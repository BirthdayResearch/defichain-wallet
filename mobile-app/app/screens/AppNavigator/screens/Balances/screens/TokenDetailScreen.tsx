import { View } from '@components/index'
import { getNativeIcon } from '@components/icons/assets'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { StackScreenProps } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import NumberFormat from 'react-number-format'
import { BalanceParamList } from '../BalancesNavigator'
import { ConversionMode } from './ConvertScreen'
import { MaterialIcons } from '@expo/vector-icons'
import { Linking, TouchableOpacity } from 'react-native'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'

interface TokenActionItems {
  title: string
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  onPress: () => void
  testID: string
}
type Props = StackScreenProps<BalanceParamList, 'TokenDetailScreen'>

export function TokenDetailScreen ({ route, navigation }: Props): JSX.Element {
  const [token, setToken] = useState(route.params.token)
  const tokens = useTokensAPI()

  useEffect(() => {
    const t = tokens.find((t) => t.id === token.id)
    if (t !== undefined) {
      setToken({ ...t })
    }
  }, [JSON.stringify(tokens)])

  return (
    <ThemedScrollView>
      <TokenSummary token={token} />
      <ThemedSectionTitle
        testID='title_available_options'
        text={translate('screens/TokenDetailScreen', 'AVAILABLE OPTIONS')}
      />

      {
        token.id !== '0' && (
          <>
            <TokenActionRow
              icon='arrow-upward'
              onPress={() => navigation.navigate({
                name: 'Send',
                params: { token },
                merge: true
              })}
              testID='send_button'
              title={translate('screens/TokenDetailScreen', 'Send to other wallet')}
            />

            <TokenActionRow
              icon='arrow-downward'
              onPress={() => navigation.navigate('Receive')}
              testID='receive_button'
              title={`${translate('screens/TokenDetailScreen', 'Receive')} ${token.displaySymbol}`}
            />
          </>
        )
      }

      {
        token.symbol === 'DFI' && (
          <TokenActionRow
            icon='swap-vert'
            onPress={() => {
              const mode: ConversionMode = token.id === '0_utxo' ? 'utxosToAccount' : 'accountToUtxos'
              navigation.navigate({
                name: 'Convert',
                params: { mode },
                merge: true
              })
            }}
            testID='convert_button'
            title={`${translate('screens/TokenDetailScreen', 'Convert to {{symbol}}', { symbol: `${token.id === '0_utxo' ? 'Token' : 'UTXO'}` })}`}
          />
        )
      }
    </ThemedScrollView>
  )
}

function TokenSummary (props: { token: WalletToken}): JSX.Element {
  const Icon = getNativeIcon(props.token.avatarSymbol)
  const { getTokenUrl } = useDeFiScanContext()

  const onTokenUrlPressed = async (): Promise<void> => {
    const id = props.token.id === '0_utxo' ? 0 : props.token.id
    const url = getTokenUrl(id)
    await Linking.openURL(url)
  }

  return (
    <ThemedView
      light={tailwind('bg-white')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('px-4 pt-6')}
    >
      <View style={tailwind('flex-row items-center mb-1')}>
        <Icon height={24} width={24} style={tailwind('mr-2')} />
        <TouchableOpacity
          onPress={onTokenUrlPressed}
          testID='token_detail_explorer_url'
        >
          <View style={tailwind('flex-row items-center')}>
            <ThemedText
              dark={tailwind('text-darkprimary-500')}
              light={tailwind('text-primary-500')}
            >
              {props.token.name}
            </ThemedText>
            <View style={tailwind('ml-2 flex-grow-0 justify-center')}>
              <ThemedIcon
                dark={tailwind('text-darkprimary-500')}
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                name='open-in-new'
                size={16}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={tailwind('flex-row items-center mb-4')}>
        <NumberFormat
          decimalScale={8}
          displayType='text'
          renderText={(value) => (
            <ThemedText
              style={tailwind('text-2xl font-bold flex-wrap mr-1')}
              testID='token_detail_amount'
            >
              {value}
            </ThemedText>
          )}
          thousandSeparator
          value={new BigNumber(props.token.amount).toFixed(8)}
        />
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-sm')}
        >
          {props.token.displaySymbol}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

function TokenActionRow ({ title, icon, onPress, testID }: TokenActionItems): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex-row py-4 pl-4 pr-2 bg-white border-b border-gray-200')}
      testID={testID}
    >
      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        name={icon}
        size={24}
      />

      <ThemedText style={tailwind('flex-grow ml-2')}>
        {title}
      </ThemedText>

      <ThemedIcon
        iconType='MaterialIcons'
        name='chevron-right'
        size={24}
      />
    </ThemedTouchableOpacity>
  )
}
