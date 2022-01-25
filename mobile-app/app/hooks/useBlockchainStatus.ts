import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { getReleaseChannel } from '@api/releaseChannel'
import { getEnvironment } from '@environment'

// MAX_TIME_DIFF set to 45 mins when blockchain is down only in Production mode, else 10 seconds for local runs
const MAX_TIME_DIFF = getEnvironment(getReleaseChannel()).debug ? 10 * 1000 : 45 * 60 * 1000

export function useBlockchainStatus (): boolean {
    const { lastSync, lastSuccessfulSync } = useSelector((state: RootState) => state.block)
    const [isBlockchainDown, setIsBlockchainDown] = useState(false)

    useEffect(() => {
        function getBlockchainStatus (): boolean {
            // 3 Scenerios
            // To display message only if blockchain is down for 45 minutes from the time that it is connected
            // To have a lastSuccessfulSync to cross check with lastSync time
            // To check if lastSuccessfulSync was 45 mins ago - this is condition is written in StatsProvider
            if (lastSync !== undefined && lastSuccessfulSync !== undefined) {
                const lastSyncTime = Date.parse(lastSync)
                const lastSuccessfulSyncTime = Date.parse(lastSuccessfulSync)
                const timeDifference = lastSyncTime - lastSuccessfulSyncTime
                return timeDifference > MAX_TIME_DIFF
            }
            return false
          }
        setIsBlockchainDown(getBlockchainStatus())
    }, [lastSync])
    return isBlockchainDown
}
