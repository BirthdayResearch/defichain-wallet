import { AnnouncementData } from '@shared-types/website'
import { Announcement, findDisplayedAnnouncementForVersion } from '../../Portfolio/components/Announcements'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { nativeApplicationVersion } from 'expo-application'
import { useCallback, useMemo, useState } from 'react'
import { OwnedTokenState, TokenState } from '../CompositeSwap/CompositeSwapScreen'
import { useTokenBestPath } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenBestPath'
import { useFocusEffect } from '@react-navigation/native'

const HIGH_FEES_URL = 'https://'

export type DexStabilizationType = 'direct-dusd-dfi' | 'composite-dusd-dfi' | 'none'

export function useDexStabilization (tokenA: OwnedTokenState | undefined, tokenB: TokenState | undefined): {
  dexStabilizationAnnouncement: Announcement | undefined
  dexStabilizationType: DexStabilizationType
} {
  const { getBestPath } = useTokenBestPath()
  const {
    language
  } = useLanguageContext()

  // local state
  const [announcementToDisplay, setAnnouncementToDisplay] = useState<AnnouncementData[]>()
  const [dexStabilizationType, setDexStabilizationType] = useState<DexStabilizationType>('none')

  const swapAnnouncement = useMemo((): Announcement | undefined => {
    return findDisplayedAnnouncementForVersion(nativeApplicationVersion ?? '0.0.0', language, [], announcementToDisplay)
  }, [announcementToDisplay, tokenA, tokenB])

  useFocusEffect(useCallback(() => {
    const _setDexStabilizationType = async (): Promise<void> => {
      setDexStabilizationType(await _getDexStabilizationType(tokenA, tokenB))
    }
    const _setAnnouncementToDisplay = async (): Promise<void> => {
      setAnnouncementToDisplay(await _getHighDexStabilizationFeeAnnouncement(tokenA, tokenB))
    }

    _setDexStabilizationType()
    _setAnnouncementToDisplay()
  }, [tokenA, tokenB]))

  const _getHighDexStabilizationFeeAnnouncement = useCallback(async (tokenA, tokenB): Promise<AnnouncementData[]> => {
    let announcement: AnnouncementData[] = []
    const dexStabilizationType = await _getDexStabilizationType(tokenA, tokenB)

    if (dexStabilizationType === 'direct-dusd-dfi') {
      announcement = [{
        lang: {
          en: 'There is currently a high DEX Stabilization fee imposed on DUSD-DFI swaps. Proceed with caution!',
          de: 'Derzeit wird eine hohe Dex-Stabilisierungsgebühr bei Tausch von DUSD-DFI erhoben. Vorsicht ist geboten!',
          'zh-Hans': '目前对 DUSD - DFI 兑换征收高额的 Dex 稳定费。请谨慎操作！',
          'zh-Hant': '目前對 DUSD - DFI 兌換徵收高額的 Dex 穩定費。 請謹慎操作！',
          fr: 'There is currently a high DEX Stabilization fee imposed on DUSD-DFI swaps. Proceed with caution!',
          es: 'There is currently a high DEX Stabilization fee imposed on DUSD-DFI swaps. Proceed with caution!',
          it: 'There is currently a high DEX Stabilization fee imposed on DUSD-DFI swaps. Proceed with caution!'
        },
        version: '0.0.0',
        url: {
          ios: HIGH_FEES_URL,
          android: HIGH_FEES_URL,
          windows: HIGH_FEES_URL,
          web: HIGH_FEES_URL,
          macos: HIGH_FEES_URL
        },
        type: 'OUTAGE'
      }]
    } else if (dexStabilizationType === 'composite-dusd-dfi') {
      announcement = [{
        lang: {
          en: 'Your swap consists of a composite path (DUSD -> DFI) which will incur high DEX Stabilization fees.',
          de: 'Your swap consists of a composite path (DUSD -> DFI) which will incur high DEX Stabilization fees.',
          'zh-Hans': 'Your swap consists of a composite path (DUSD -> DFI) which will incur high DEX Stabilization fees.',
          'zh-Hant': 'Your swap consists of a composite path (DUSD -> DFI) which will incur high DEX Stabilization fees.',
          fr: 'Your swap consists of a composite path (DUSD -> DFI) which will incur high DEX Stabilization fees.',
          es: 'Your swap consists of a composite path (DUSD -> DFI) which will incur high DEX Stabilization fees.',
          it: 'Your swap consists of a composite path (DUSD -> DFI) which will incur high DEX Stabilization fees.'
        },
        version: '0.0.0',
        url: {
          ios: HIGH_FEES_URL,
          android: HIGH_FEES_URL,
          windows: HIGH_FEES_URL,
          web: HIGH_FEES_URL,
          macos: HIGH_FEES_URL
        },
        type: 'OUTAGE'
      }]
    }
    return announcement
  }, [])

  const _getDexStabilizationType = useCallback(async (tokenA, tokenB): Promise<DexStabilizationType> => {
    if (tokenA !== undefined && tokenB !== undefined) {
      const isDUSDtoDFI = tokenA.displaySymbol === 'DUSD' && tokenB.displaySymbol === 'DFI'
      // direct swap
      if (isDUSDtoDFI) {
        return 'direct-dusd-dfi'
      }

      const { bestPath } = await getBestPath(
        tokenA.id === '0_unified' ? '0' : tokenA.id,
        tokenB.id === '0_unified' ? '0' : tokenB.id)
      const dUSDandDFIPairIndex = bestPath.findIndex(path => {
        return (path.tokenA.displaySymbol === 'DUSD' && path.tokenB.displaySymbol === 'DFI') ||
          (path.tokenA.displaySymbol === 'DFI' && path.tokenB.displaySymbol === 'DUSD')
      })

      /*
        Otherwise, check for composite swap
          1. Get index of DUSD-DFI pair
          2. Check if the previous pair tokenB is DUSD to ensure that the direction of DUSD-DFI is DUSD -> DFI
      */
      if (dUSDandDFIPairIndex !== -1 && bestPath[dUSDandDFIPairIndex - 1]?.tokenB.displaySymbol === 'DUSD') {
        return 'composite-dusd-dfi'
      }
    }

    return 'none'
  }, [])

  return {
    dexStabilizationAnnouncement: swapAnnouncement,
    dexStabilizationType
  }
}
