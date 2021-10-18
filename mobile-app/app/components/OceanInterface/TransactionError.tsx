import React from 'react'
import { View } from 'react-native'
import { translate } from '@translations'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText } from '@components/themed'
import { TransactionCloseButton } from '@components/OceanInterface'

interface TransactionErrorProps {
  errMsg: string
  onClose: () => void
}

enum ErrorCodes {
  UnknownError = 0,
  InsufficientUTXO = 1,
  InsufficientBalance = 2,
  PoolSwapHigher = 3,
}

interface ErrorMapping {
  code: ErrorCodes
  message: string
}

export function TransactionError ({ errMsg, onClose }: TransactionErrorProps): JSX.Element {
  const err = errorMessageMapping(errMsg)
  return (
    <>
      <ThemedIcon
        dark={tailwind('text-darkerror-500')}
        iconType='MaterialIcons'
        light={tailwind('text-error-500')}
        name='error'
        size={20}
      />

      <View style={tailwind('flex-auto mx-3 justify-center')}>
        <ThemedText
          style={tailwind('text-sm font-bold')}
        >
          {translate('screens/OceanInterface', `Error Code: ${err.code}`)}
        </ThemedText>

        <ThemedText
          ellipsizeMode='tail'
          numberOfLines={1}
          style={tailwind('text-sm font-bold')}
        >
          {translate('screens/OceanInterface', err.message)}
        </ThemedText>
      </View>

      <TransactionCloseButton onPress={onClose} />
    </>
  )
}

function errorMessageMapping (err: string): ErrorMapping {
  if (err === 'not enough balance after combing all prevouts') {
    return {
      code: ErrorCodes.InsufficientUTXO,
      message: 'Insufficient UTXO DFI'
    }
  } else if (err.includes('amount') && err.includes('is less than')) {
    return {
      code: ErrorCodes.InsufficientBalance,
      message: 'Not enough balance'
    }
  } else if (err.includes('Price is higher than indicated.')) {
    return {
      code: ErrorCodes.PoolSwapHigher,
      message: 'Price is higher than indicated'
    }
  } else if (err.includes('no prevouts available to create a transaction')) {
    return {
      code: ErrorCodes.InsufficientUTXO,
      message: 'Insufficient UTXO DFI'
    }
  }

  return {
    code: ErrorCodes.UnknownError,
    message: err
  }
}
