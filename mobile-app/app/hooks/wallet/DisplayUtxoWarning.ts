import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { DFITokenSelector, DFIUtxoSelector } from '@store/wallet'

export function useDisplayUtxoWarning (): {
  getDisplayUtxoWarningStatus: (amountInDFI: BigNumber, displaySymbol: string) => boolean
} {
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const reservedDFI = 0.1

  const getDisplayUtxoWarningStatus = useCallback((amountInDFI: BigNumber, displaySymbol: string) => {
    if (new BigNumber(amountInDFI).isNaN() || new BigNumber(amountInDFI).isZero() || displaySymbol !== 'DFI') {
      return false
    }

    const toLessInUtxo = BigNumber.max(new BigNumber(amountInDFI).minus(DFIToken.amount), 0)
    return new BigNumber(DFIUtxo.amount).minus(toLessInUtxo).isLessThanOrEqualTo(reservedDFI)
  }, [DFIToken, DFIUtxo])

  return {
    getDisplayUtxoWarningStatus
  }
}
