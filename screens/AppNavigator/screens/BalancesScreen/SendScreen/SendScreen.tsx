import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, View, StyleSheet, Modal } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { BarCodeScanner } from 'expo-barcode-scanner'
import NumberFormat from 'react-number-format'
import tailwind from 'tailwind-rn'
import { Text, TextInput } from '../../../../../components'
import { IconDFI } from '../../../../../components/icons/tokens/IconDFI'
import { PrimaryColor, PrimaryColorStyle } from '../../../../../constants/Theme'
import { translate } from '../../../../../translations'

export function SendScreen (): JSX.Element {
  const [isQRScanning, setIsQRScanning] = useState(false)
  const { control, setValue } = useForm()

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <Modal
        animationType='slide'
        transparent
        visible={isQRScanning}
      >
        <View style={tailwind('flex-1 items-center justify-center')}>
          <View style={[styles.modalView, tailwind('bg-white rounded-xl w-9/12 h-3/5 relative items-center')]}>
            <QRScanner onScan={(value: string) => {
              setValue('address', value)
              setIsQRScanning(false)
            }}
            />

            <TouchableOpacity
              style={[tailwind('mt-2 px-2 py-1.5 ml-3 flex-row items-center border border-gray-300 rounded')]}
              onPress={() => {
                setIsQRScanning(false)
              }}
            >
              <Text style={[tailwind('mx-1'), PrimaryColorStyle.text]}>
                {translate('screens/SendScreen', 'Close Modal')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={tailwind('py-4')}>
        <Text
          style={tailwind('text-sm text-gray-300 font-bold pl-4 mt-4 mb-2')}
        >{translate('screens/SendScreen', 'TO ADDRESS')}
        </Text>
        <Controller
          control={control}
          rules={{
            required: true
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={tailwind('flex-row w-full')}>
              <TextInput
                style={tailwind('flex-grow p-4 bg-white')}
                autoCapitalize='none'
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder={translate('screens/SendScreen', 'Enter an address')}
              />
              <TouchableOpacity
                style={tailwind('p-4 bg-white')} onPress={() => {
                  setIsQRScanning(true)
                }}
              >
                <MaterialIcons name='qr-code-scanner' size={24} color={PrimaryColor} />
              </TouchableOpacity>
            </View>
          )}
          name='address'
          defaultValue=''
        />

        <Text
          style={tailwind('text-sm text-gray-300 font-bold pl-4 mt-8 mb-2')}
        >{translate('screens/SendScreen', 'SEND')}
        </Text>
        <Controller
          control={control}
          rules={{
            required: true
          }}
          render={({ field: { onChange, onBlur, value } }) => (
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
                <IconDFI />
                <Text style={tailwind('ml-2')}>DFI</Text>
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
              value={1000000} decimalScale={8} thousandSeparator displayType='text' suffix=' DFI'
              renderText={(value) => <Text style={tailwind('text-gray-500')}>{value}</Text>}
            />
          </View>
          <TouchableOpacity>
            <Text
              style={[PrimaryColorStyle.text, tailwind('font-bold')]}
            >{translate('screens/SendScreen', 'MAX')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[tailwind('m-4 mt-8 p-3 rounded flex-row justify-center'), PrimaryColorStyle.bg]}
        >
          <Text style={tailwind('text-white font-bold')}>SEND</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  )
}

function QRScanner ({ onScan }: { onScan: (code: string) => void }): JSX.Element {
  const [scanned, setScanned] = useState(false)

  const handleBarCodeScanned = ({ data }: { data: string }): void => {
    setScanned(true)
    onScan(data)
  }

  return (
    <BarCodeScanner
      onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      barCodeTypes={['qr']}
      style={tailwind('flex-1 w-full')}
    />
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
