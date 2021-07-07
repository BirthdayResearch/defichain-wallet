import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import tailwind from 'tailwind-rn'
import { Text, TextInput } from '../../../../../components'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import { PrimaryButton } from '../../../../../components/PrimaryButton'
import { PrimaryColor, PrimaryColorStyle } from '../../../../../constants/Theme'
import { WalletToken } from '../../../../../store/wallet'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'

interface AmountForm {
  control: Control
  token: WalletToken
  onMaxPress: (amount: string) => void
}

interface AddressForm {
  control: Control
}

type Props = StackScreenProps<BalanceParamList, 'SendScreen'>

export function SendScreen ({ route }: Props): JSX.Element {
  const [token] = useState(route.params.token)
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })

  async function onSubmit (): Promise<void> {
    if (isValid) {
      const values = getValues()
      await send(new BigNumber(values.amount), values.address)
    }
  }

  async function send (amount: BigNumber, address: string): Promise<void> {
    console.log(amount, address)
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <AddressRow control={control} />
      <AmountRow
        token={token} control={control} onMaxPress={async (amount) => {
          setValue('amount', amount)
          await trigger('amount')
        }}
      />
      <PrimaryButton disabled={!isValid} title='Send' onPress={onSubmit}>
        <Text style={tailwind('text-white font-bold')}>{translate('screens/SendScreen', 'SEND')}</Text>
      </PrimaryButton>
    </ScrollView>
  )
}

function AddressRow ({ control }: AddressForm): JSX.Element {
  return (
    <>
      <Text
        style={tailwind('text-sm font-bold pl-4 mt-4 mb-2')}
      >{translate('screens/SendScreen', 'TO ADDRESS')}
      </Text>
      <Controller
        control={control}
        rules={{
          required: true
        }}
        render={({ field: { value, onBlur, onChange } }) => (
          <View style={tailwind('flex-row w-full')}>
            <TextInput
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={translate('screens/SendScreen', 'Enter an address')}
            />
            <TouchableOpacity
              style={tailwind('p-4 bg-white')}
            >
              <MaterialIcons name='qr-code-scanner' size={24} color={PrimaryColor} />
            </TouchableOpacity>
          </View>
        )}
        name='address'
        defaultValue=''
      />
    </>
  )
}

function AmountRow ({ token, control, onMaxPress }: AmountForm): JSX.Element {
  const Icon = getTokenIcon(token.avatarSymbol)
  return (
    <>
      <Text
        style={tailwind('text-sm font-bold pl-4 mt-8 mb-2')}
      >{translate('screens/SendScreen', 'SEND')}
      </Text>
      <Controller
        control={control}
        rules={{
          required: true,
          pattern: /^\d*\.?\d*$/,
          max: token.amount
        }}
        render={({ field: { onBlur, onChange, value } }) => (
          <View style={tailwind('flex-row w-full border-b border-gray-100')}>
            <TextInput
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType='numeric'
              placeholder={translate('screens/SendScreen', 'Enter an amount')}
            />
            <View style={tailwind('flex-row bg-white pr-4 items-center')}>
              <Icon />
              <Text style={tailwind('ml-2')}>{token.symbol}</Text>
            </View>
          </View>
        )}
        name='amount'
        defaultValue=''
      />
      <View style={tailwind('flex-row w-full bg-white p-4')}>
        <View style={tailwind('flex-grow flex-row')}>
          <Text>{translate('screens/SendScreen', 'Balance: ')}</Text>
          <NumberFormat
            value={token.amount} decimalScale={8} thousandSeparator displayType='text' suffix={` ${token.symbol}`}
            renderText={(value) => <Text style={tailwind('text-gray-500')}>{value}</Text>}
          />
        </View>
        <TouchableOpacity onPress={() => onMaxPress(token.amount)}>
          <Text
            style={[PrimaryColorStyle.text, tailwind('font-bold')]}
          >{translate('screens/SendScreen', 'MAX')}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  )
}
