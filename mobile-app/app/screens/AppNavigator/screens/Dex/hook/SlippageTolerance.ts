import { SlippageTolerancePersistence } from '@api'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'

export interface SlippageTolerance {
    slippage: BigNumber
    setSlippage: (val: BigNumber) => Promise<void>
}

export function useSlippageTolerance (): SlippageTolerance {
    const logger = useLogger()
    const [slippage, setSlippage] = useState(new BigNumber(1))

    useEffect(() => {
        SlippageTolerancePersistence.get().then((slippageValue: BigNumber) => {
          setSlippage(new BigNumber(slippageValue))
        }).catch(logger.error)
    }, [])

    const updateSlippageTolerance = async (slippageVal: BigNumber): Promise<void> => {
        setSlippage(new BigNumber(slippageVal))
        await SlippageTolerancePersistence.set(slippageVal)
    }

    return {
        slippage,
        setSlippage: updateSlippageTolerance
    }
}
