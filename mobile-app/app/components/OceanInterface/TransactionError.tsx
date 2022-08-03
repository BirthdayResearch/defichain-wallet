import { useState, useEffect, useCallback } from 'react'
import { translate } from '@translations'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { TransactionCloseButton } from './TransactionCloseButton'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { View, TouchableOpacity, Platform } from 'react-native'

interface TransactionErrorProps {
  errMsg: string
  onClose: () => void
}

export enum ErrorCodes {
  UnknownError = 0,
  InsufficientUTXO = 1,
  InsufficientBalance = 2,
  PoolSwapHigher = 3,
  InsufficientDFIInVault = 4,
  LackOfLiquidity = 5,
  PaybackLoanInvalidPrice = 6,
  NoLiveFixedPrices = 7,
  VaultNotEnoughCollateralization = 8,
  DustValue = 9
}

export interface ErrorMapping {
  code: ErrorCodes
  message: string
}

export function TransactionError ({ errMsg, onClose }: TransactionErrorProps): JSX.Element {
  const logger = useLogger()
  const [expand, setExpand] = useState(false)
  const [canExpand, setCanExpand] = useState(false)
  const numberOfLines = 2

  useEffect(() => {
    logger.error(`transaction error: ${errMsg}`)
  }, [errMsg])

  const getNumberOfLines = (): number => {
    if (Platform.OS === 'web') {
      return numberOfLines
    }
    return (canExpand && !expand) ? numberOfLines : 0
  }

  const err = errorMessageMapping(errMsg)

  const onTextLayout = useCallback(e => {
    if (e.nativeEvent.lines.length > numberOfLines) {
      setCanExpand(true)
    }
  }, [])

  return (
    <ThemedViewV2
      dark={tailwind('bg-mono-dark-v2-00')}
      light={tailwind('bg-mono-light-v2-00')}
      style={tailwind('flex-row items-center justify-between w-full rounded-lg-v2 px-5 py-3 border-0.5 border-error-500')}
    >
      <View
        style={tailwind('flex flex-row items-center justify-between w-9/12')}
      >
        <ThemedIcon
          dark={tailwind('text-darkerror-500')}
          iconType='MaterialIcons'
          light={tailwind('text-error-500')}
          name='info'
          size={20}
        />
        <View style={tailwind('ml-2.5 w-full')}>
          <View style={tailwind('flex flex-row items-center')}>
            <ThemedTextV2
              light={tailwind('text-mono-light-v2-900')}
              dark={tailwind('text-mono-dark-v2-900')}
              style={tailwind('text-sm font-normal-v2')}
            >
              {translate('screens/OceanInterface', `Error Code: ${err.code}`)}
            </ThemedTextV2>
            {canExpand && (
              <TouchableOpacity
                onPress={() => setExpand(!expand)}
                testID='details_dfi'
              >
                <ThemedIcon
                  light={tailwind('text-mono-light-v2-900')}
                  dark={tailwind('text-mono-dark-v2-900')}
                  style={tailwind('font-bold-v2')}
                  iconType='MaterialIcons'
                  name={!expand ? 'expand-more' : 'expand-less'}
                  size={24}
                />
              </TouchableOpacity>
            )}

          </View>

          <ThemedTextV2
            light={tailwind('text-mono-light-v2-700')}
            dark={tailwind('text-mono-dark-v2-700')}
            ellipsizeMode='tail'
            numberOfLines={getNumberOfLines()}
            onTextLayout={onTextLayout}
            style={tailwind('text-sm font-normal-v2')}
          >
            {translate('screens/OceanInterface', err.message)}
          </ThemedTextV2>
        </View>
      </View>

      <TransactionCloseButton onPress={onClose} />
    </ThemedViewV2>
  )
}

function errorMessageMapping (err: string): ErrorMapping {
  if (err === 'not enough balance after combing all prevouts') {
    return {
      code: ErrorCodes.InsufficientUTXO,
      message: 'Insufficient UTXO DFI.'
    }
  } else if (err.includes('amount') && err.includes('is less than')) {
    return {
      code: ErrorCodes.InsufficientBalance,
      message: 'Insufficient balance. Top up to proceed.'
    }
  } else if (err.includes('Price is higher than indicated.')) {
    return {
      code: ErrorCodes.PoolSwapHigher,
      message: 'Swap price is higher than the range allowed by the slippage tolerance. Increase tolerance percentage to proceed.'
    }
  } else if (err.includes('no prevouts available to create a transaction')) {
    return {
      code: ErrorCodes.InsufficientUTXO,
      message: 'Insufficient UTXO DFI.'
    }
  } else if (err.includes('At least 50% of the vault must be in DFI when taking a loan')) {
    return {
      code: ErrorCodes.InsufficientDFIInVault,
      message: 'Insufficient DFI collateral. (≥50%)'
    }
  } else if (err.includes('Lack of liquidity')) {
    return {
      code: ErrorCodes.LackOfLiquidity,
      message: 'Insufficient liquidity.'
    }
  } else if (err.includes('Cannot payback loan while any of the asset\'s price is invalid')) {
    return {
      code: ErrorCodes.PaybackLoanInvalidPrice,
      message: 'Unable to payback loan due to invalid price.'
    }
  } else if (err.includes('No live fixed prices')) {
    return {
      code: ErrorCodes.NoLiveFixedPrices,
      message: 'No live fixed prices for loan token.'
    }
  } else if (err.includes('Vault does not have enough collateralization ratio defined by loan scheme')) {
    return {
      code: ErrorCodes.VaultNotEnoughCollateralization,
      message: 'Vault does not meet min. collateral ratio. Add collateral to proceed.'
    }
  } else if (err.includes('dust (code 64)')) {
    return {
      code: ErrorCodes.DustValue,
      message: 'Input amount is too low. Increase the amount to continue.'
    }
  }

  return {
    code: ErrorCodes.UnknownError,
    message: getErrorMessage(err)
  }
}

function getErrorMessage (err: string): string {
  const errParts = err?.split(':')
  if (errParts.length !== 4) {
    return err
  }

  return errParts[2]?.concat(errParts[3])?.trim() // display error message without HTTP error code and url path
}
