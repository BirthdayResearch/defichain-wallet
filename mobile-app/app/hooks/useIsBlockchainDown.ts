import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@store'

const MAX_TIME_DIFF = 45 * 60 * 1000 // 45 mins

export function useIsBlockchainDown (): boolean {
    const blockLastSync = useSelector((state: RootState) => state.block.lastSync)
    const [isBlockchainDown, setIsBlockchainDown] = useState(false)

    useEffect(() => {
        function isBlockchainDownFn (): boolean {
            const nowEpoch = Date.now()
            let blockLastSyncTime: number | undefined

            if (blockLastSync !== undefined && blockLastSyncTime !== undefined) {
                blockLastSyncTime = Date.parse(blockLastSync) // convert date string to date number
                const timeDifference = nowEpoch - blockLastSyncTime

                if (timeDifference > MAX_TIME_DIFF) {
                    return true
                }
            }
            return false
          }

        if (isBlockchainDownFn()) {
            setIsBlockchainDown(true)
        } else {
            setIsBlockchainDown(false)
        }
    }, [isBlockchainDown, blockLastSync])
    return isBlockchainDown
}
