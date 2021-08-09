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
import { hasTxQueued, transactionQueue } from '../../../../store/transaction_queue'
import { Control, Controller, useForm } from 'react-hook-form'
import { NetworkName } from '@defichain/jellyfish-network'
import { Logging } from '../../../../api'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
// import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
// import { token } from '@defichain/jellyfish-api-core'
import { Dispatch } from 'redux'
import { useDispatch, useSelector } from 'react-redux'

interface CreateMasternodeForm {
  operatorAddress: string
}

type Props = StackScreenProps<MasternodeParamList, 'CreateMasternodeScreen'>

export function MasternodeCreateScreen ({ navigation }: Props): JSX.Element {
  const { networkName } = useNetworkContext()
  console.log('networkName: ', networkName)
  // const [operatorAddress, setOperatorAddress] = useState<string>('')
  const { control, setValue, formState: { isValid }, getValues/*, trigger */ } = useForm({ mode: 'onChange' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))

  const dispatch = useDispatch()

  async function onSubmit (): Promise<void> {
    if (hasPendingJob) {
      return
    }
    console.log('isValid: ', isValid)
    setIsSubmitting(true)
    if (isValid) {
      const values = getValues()
      console.log('values: ', values)
      await create(
        {
          operatorAddress: values.operatorAddress
        },
        dispatch
      ).catch(err => {
        console.log('create err: ', err)
        Logging.error(err)
      })
    }
    setIsSubmitting(false)
  }

  async function create ({
    operatorAddress
  }: CreateMasternodeForm,
  dispatch: Dispatch<any>
  ): Promise<void> {
    try {
      const operatorAuthAddress = DeFiAddress.from(networkName, operatorAddress).getScript()
      console.log('operatorAuthAddress: ', operatorAuthAddress)

      // const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
      const signer = async (account: WhaleWalletAccount): Promise<any> => {
        console.log('sign')
        const script = await account.getScript()
        console.log('script: ', script)
        console.log('account: ', account)

        // const builder = account.withTransactionBuilder()

        const createMasternode = {
          operatorType: 1, // 1 | 4
          // TODO(canonbrother): display input only if pick set operatorAddr option
          operatorAuthAddress: operatorAddress
          // TODO(canonbrother): need to check how timelock work
          // timeLock: 0
        }
        console.log('createMasternode: ', createMasternode)

        // TODO(canonbrother): pending on createmn txn builder merge
        // const dfTx = await builder.masternode.create(createMasternode, script)
        // return new CTransactionSegWit(dfTx)

        return ''
      }

      dispatch(transactionQueue.actions.push({
        sign: signer,
        title: `${translate('screens/CreateMasternode', 'Creating Masternode')}`
      }))
    } catch (err) {
      console.log('err: ', err)
      Logging.error(err)
    }
  }

  return (
    <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
      <AddressRow
        control={control}
        networkName={networkName}
        onQrButtonPress={() => navigation.navigate('BarCodeScanner', {
          onQrScanned: (value: any) => setValue('operatorAddress', value)
        })}
      />
      <Button
        testID='create_masternode_button'
        disabled={!isValid || isSubmitting || hasPendingJob}
        label={translate('screens/MasternodeCreateScreen', 'CREATE')}
        title='Create' onPress={onSubmit}
      />
    </ScrollView>
  )
}

// perhaps add onGenAddrButtonPress
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
            // TODO(canonbrother): other than validate network type, also validate address type
            // only accept legacy and bech32
            // 2N9pHg9wKQK5hZxzwPfxZfy3jw76YFXriS2
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
            {/*
            TODO(canonbrother): generate legach/bech32 address
            <TouchableOpacity
              testID='gen_addr_button'
              style={tailwind('w-14 p-4 bg-white')}
              onPress={onGenAddrPress}
            /> */}
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
