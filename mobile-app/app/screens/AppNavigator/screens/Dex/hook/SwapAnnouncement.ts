import { AnnouncementData } from '@shared-types/website'
import { Announcement, findDisplayedAnnouncementForVersion } from '../../Portfolio/components/Announcements'
import { useDisplayAnnouncement } from '../../Portfolio/hooks/DisplayAnnouncement'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { nativeApplicationVersion } from 'expo-application'
import { useCallback, useMemo } from 'react'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { OwnedTokenState, TokenState } from '../CompositeSwap/CompositeSwapScreen'

export function useSwapAnnouncement (tokenA: OwnedTokenState | undefined, tokenB: TokenState | undefined): {
    swapAnnouncement: Announcement | undefined
    hideSwapAnnouncement: (id: string) => void
    isHighFeesEnabled: boolean
} {
    const { isFeatureAvailable } = useFeatureFlagContext()
    const isHighFeesFlagEnabled = isFeatureAvailable('dusd_dfi_high_fee')
    const highFeesUrl = 'https://'
    const dUSDToDFIHighFees: AnnouncementData[] = [{
        lang: {
            en: 'There are high fees on DUSD-DFI',
            de: 'There are high fees on DUSD-DFI',
            'zh-Hans': 'There are high fees on DUSD-DFI',
            'zh-Hant': 'There are high fees on DUSD-DFI',
            fr: 'There are high fees on DUSD-DFI',
            es: 'There are high fees on DUSD-DFI',
            it: 'There are high fees on DUSD-DFI'
        },
        version: '0.0.0',
        url: {
            ios: highFeesUrl,
            android: highFeesUrl,
            windows: highFeesUrl,
            web: highFeesUrl,
            macos: highFeesUrl
        },
        type: 'OUTAGE'
    }]
    const {
        language
    } = useLanguageContext()
    const {
        hiddenAnnouncements,
        hideAnnouncement
    } = useDisplayAnnouncement()
    const swapAnnouncement = useMemo(() => {
        return findDisplayedAnnouncementForVersion(nativeApplicationVersion ?? '0.0.0', language, hiddenAnnouncements, dUSDToDFIHighFees)
    }, [language, nativeApplicationVersion, hiddenAnnouncements])

    const isHighFeesEnabled = useMemo(() => {
        const isDUSDtoDFI = tokenA?.displaySymbol === 'DUSD' && tokenB?.displaySymbol === 'DFI'
        return isHighFeesFlagEnabled && isDUSDtoDFI
    }, [tokenA, tokenB])

    const hideSwapAnnouncement = useCallback((id: string) => {
        hideAnnouncement(id)
    }, [])

    return {
        swapAnnouncement: isHighFeesEnabled ? swapAnnouncement : undefined,
        hideSwapAnnouncement,
        isHighFeesEnabled
    }
}
