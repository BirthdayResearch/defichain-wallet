import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, View, StyleSheet, Modal } from 'react-native'
import { useForm, Controller, Control } from 'react-hook-form'
import { BarCodeScanner } from 'expo-barcode-scanner'
import NumberFormat from 'react-number-format'
import tailwind from 'tailwind-rn'
import { PrimaryButton, Text, TextInput } from '../../../../../components'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import { PrimaryColor, PrimaryColorStyle } from '../../../../../constants/Theme'
import { translate } from '../../../../../translations'
import { BalanceParamList } from '../BalancesNavigator'

interface QRScannerProps {
  onScan: (code: string) => void
  isQRScanning: boolean
  onCloseModal: () => void
}

interface AmountForm {
  control: Control
  token: AddressToken
  onMaxPress: (amount: string) => void
}

interface AddressForm {
  control: Control
  openQRScanner: () => void
}

type Props = StackScreenProps<BalanceParamList, 'SendScreen'>

export function SendScreen ({ route }: Props): JSX.Element {
  const [token] = useState(route.params.token)
  const [isQRScanning, setIsQRScanning] = useState(false)
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })

  const onSubmit = (): void => {
    console.log(isValid)
    console.log(getValues())
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <QRScanner
        onScan={async (value: string) => {
          setValue('address', value)
          await trigger('address')
          setIsQRScanning(false)
        }} onCloseModal={() => setIsQRScanning(false)} isQRScanning={isQRScanning}
      />
      <AddressRow control={control} openQRScanner={() => setIsQRScanning(true)} />
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

function AddressRow ({ control, openQRScanner }: AddressForm): JSX.Element {
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
              style={tailwind('p-4 bg-white')} onPress={openQRScanner}
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
  const Icon = getTokenIcon(token.symbol)
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

function QRScanner ({ onScan, isQRScanning, onCloseModal }: QRScannerProps): JSX.Element {
  const [scanned, setScanned] = useState(false)

  const handleBarCodeScanned = ({ data }: { data: string }): void => {
    setScanned(true)
    onScan(data)
  }

  return (
    <Modal
      animationType='slide'
      transparent
      visible={isQRScanning}
    >
      <View style={tailwind('flex-1 items-center justify-center')}>
        <View style={[styles.modalView, tailwind('bg-white rounded-xl w-9/12 h-3/5 relative items-center')]}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            barCodeTypes={['qr']}
            style={tailwind('flex-1 w-full')}
          />

          <TouchableOpacity
            style={[tailwind('mt-2 px-2 py-1.5 ml-3 flex-row items-center border border-gray-300 rounded')]}
            onPress={onCloseModal}
          >
            <Text style={[tailwind('mx-1'), PrimaryColorStyle.text]}>
              {translate('screens/SendScreen', 'Close Modal')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalView: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10
  }
})
