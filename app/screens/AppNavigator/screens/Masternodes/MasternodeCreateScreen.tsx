import * as React from 'react'
import { useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { Button } from '../../../../components/Button'
import { RootState } from '../../../../store'
import { tailwind } from '../../../../tailwind'
import { MasternodeParamList } from './MasternodesNavigator'
import { translate } from '../../../../translations'
import { TextInput, View } from '../../../../components'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { SectionTitle } from '../../../../components/SectionTitle'
import { DeFiAddress } from '@defichain/jellyfish-address'
import { MaterialIcons } from '@expo/vector-icons'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { hasTxQueued } from '../../../../store/transaction_queue'
import { useSelector } from 'react-redux'
import { Control, Controller, useForm } from 'react-hook-form'
import { NetworkName } from '@defichain/jellyfish-network'

type Props = StackScreenProps<MasternodeParamList, 'CreateMasternodeScreen'>

export function MasternodeCreateScreen ({ navigation }: Props): JSX.Element {
  const { networkName } = useNetworkContext()
  // const [operatorAddress, setOperatorAddress] = useState<string>('')
  const { control, setValue, formState: { isValid }/*, getValues, trigger */ } = useForm({ mode: 'onChange' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))

  // const updateAddress = useCallback((address: string): void => {
  //   setOperatorAddress(address)
  // }, [])

  async function onSubmit (): Promise<void> {
    if (hasPendingJob) {
      return
    }
    setIsSubmitting(true)
    if (isValid) {
      // const values = getValues()
      // api
    }
    setIsSubmitting(false)
  }

  return (
    <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
      <AddressRow
        control={control}
        networkName={networkName}
        onQrButtonPress={() => navigation.navigate('BarCodeScanner', {
          onQrScanned: (value: any) => setValue('address', value)
        })}
      />
      <Button
        testID='create_button'
        disabled={!isValid || isSubmitting || hasPendingJob}
        label={translate('screens/MasternodeCreateScreen', 'CREATE')}
        title='Create' onPress={onSubmit}
      />
    </ScrollView>
  )
}

function AddressRow ({
  control,
  networkName,
  onQrButtonPress
}: { control: Control, networkName: NetworkName, onQrButtonPress: () => void }): JSX.Element {
  return (
    <>
      <SectionTitle
        text={translate('screens/MasternodeCreateScreen', 'OPERATOR ADDRESS')}
        testID='title_operator_address'
      />
      <Controller
        control={control}
        rules={{
          required: true,
          validate: {
            isValidAddress: (address) => DeFiAddress.from(networkName, address).valid
          }
        }}
        render={({ field: { value, onBlur, onChange } }) => (
          <View style={tailwind('flex-row w-full')}>
            <TextInput
              testID='address_input'
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={translate('screens/MasternodeCreateScreen', 'Enter an operator address')}
            />
            <TouchableOpacity
              testID='qr_code_button'
              style={tailwind('w-14 p-4 bg-white')}
              onPress={onQrButtonPress}
            >
              <MaterialIcons name='qr-code-scanner' size={24} style={tailwind('text-primary')} />
            </TouchableOpacity>
          </View>
        )}
        name='operatorAddress'
        defaultValue=''
      />
    </>
  )
}
