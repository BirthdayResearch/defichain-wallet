import { AnnouncementData } from '@shared-types/website'
import { Announcement, findDisplayedAnnouncementForVersion } from '../../Portfolio/components/Announcements'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { nativeApplicationVersion } from 'expo-application'
import { useCallback, useState } from 'react'
import { OwnedTokenState, TokenState } from '../CompositeSwap/CompositeSwapScreen'
import { useTokenBestPath } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenBestPath'
import { useFocusEffect } from '@react-navigation/native'

export type DexStabilizationType = 'direct-dusd-with-fee' | 'composite-dusd-with-fee' | 'none'

type DexStabilizationTokenA = OwnedTokenState | undefined
type DexStabilizationTokenB = TokenState | undefined

interface DexStabilization {
  dexStabilizationType: DexStabilizationType
  pair: {
    tokenADisplaySymbol: string
    tokenBDisplaySymbol: string
  }
}

export function useDexStabilization (tokenA: DexStabilizationTokenA, tokenB: DexStabilizationTokenB, fee?: string): {
  dexStabilizationAnnouncement: Announcement | undefined
  dexStabilization: DexStabilization
} {
  const { getBestPath } = useTokenBestPath()
  const {
    language
  } = useLanguageContext()

  // local state
  const [announcementToDisplay, setAnnouncementToDisplay] = useState<AnnouncementData[]>()
  const [dexStabilization, setDexStabilization] = useState<DexStabilization>({ dexStabilizationType: 'none', pair: { tokenADisplaySymbol: '', tokenBDisplaySymbol: '' } })

  const swapAnnouncement = findDisplayedAnnouncementForVersion(nativeApplicationVersion ?? '0.0.0', language, [], announcementToDisplay)

  useFocusEffect(useCallback(() => {
    const _setDexStabilizationType = async (): Promise<void> => {
      setDexStabilization(await _getDexStabilization(tokenA, tokenB))
    }
    const _setAnnouncementToDisplay = async (): Promise<void> => {
      setAnnouncementToDisplay(await _getHighDexStabilizationFeeAnnouncement(tokenA, tokenB, fee))
    }

    _setDexStabilizationType()
    _setAnnouncementToDisplay()
  }, [tokenA, tokenB, fee]))

  const getHighFeesUrl = (tokenA: OwnedTokenState, tokenB: TokenState): string => {
    let highFeesUrl = ''

    if (tokenA.displaySymbol === 'DUSD' && tokenB.displaySymbol === 'DFI') {
      highFeesUrl = 'https://defiscan.live/dex/DUSD'
    } else if (tokenA.displaySymbol === 'DUSD' && tokenB.displaySymbol === 'dUSDT') {
      highFeesUrl = 'https://defiscan.live/dex/dUSDT-DUSD'
    } else if (tokenA.displaySymbol === 'DUSD' && tokenB.displaySymbol === 'dUSDC') {
      highFeesUrl = 'https://defiscan.live/dex/dUSDC-DUSD'
    }

    return highFeesUrl
  }

  const _getHighDexStabilizationFeeAnnouncement = useCallback(async (tokenA: DexStabilizationTokenA, tokenB: DexStabilizationTokenB, fee: string = '0'): Promise<AnnouncementData[]> => {
    let announcement: AnnouncementData[] = []

    if (tokenA === undefined || tokenB === undefined) {
      return announcement
    }

    const { dexStabilizationType, pair } = await _getDexStabilization(tokenA, tokenB)
    const highFeesUrl = getHighFeesUrl(tokenA, tokenB)

    if (dexStabilizationType === 'direct-dusd-with-fee') {
      announcement = [{
        lang: {
          en: `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`,
          de: `Derzeit wird eine hohe DEX-Stabilisierungsgebühr von ${fee}% auf ${tokenA.displaySymbol} -> ${tokenB.displaySymbol}-Tauschgeschäfte erhoben. Vorsicht ist geboten!`,
          'zh-Hans': `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`,
          'zh-Hant': `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`,
          fr: `Il y a actuellement des frais de stabilisation DEX élevés de ${fee}% imposés sur les échanges de ${tokenA.displaySymbol} -> ${tokenB.displaySymbol}. Procéder avec prudence !`,
          es: `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`,
          it: `There is currently a high DEX Stabilization fee of ${fee}% imposed on ${tokenA.displaySymbol} -> ${tokenB.displaySymbol} swaps. Proceed with caution!`
        },
        version: '>=1.16.1',
        url: {
          ios: highFeesUrl,
          android: highFeesUrl,
          windows: highFeesUrl,
          web: highFeesUrl,
          macos: highFeesUrl
        },
        type: 'EMERGENCY'
      }]
    } else if (dexStabilizationType === 'composite-dusd-with-fee') {
      announcement = [{
        lang: {
          en: `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`,
          de: `Dein Tausch besteht aus einem zusammengesetzten Pfad (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) im Rahmen eines Komposit-Swaps, für den DEX-Stabilisierungsgebühren in Höhe von ${fee}% anfallen.`,
          'zh-Hans': `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`,
          'zh-Hant': `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`,
          fr: `Votre échange consiste en un chemin composite (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) dans le cadre d'un swap composite qui entraînera des frais de stabilisation DEX de ${fee}%. `,
          es: `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`,
          it: `Your swap consists of a composite path (${pair.tokenADisplaySymbol} -> ${pair.tokenBDisplaySymbol}) which will incur DEX Stabilization fees of ${fee}%.`
        },
        version: '>=1.16.1',
        url: {
          ios: highFeesUrl,
          android: highFeesUrl,
          windows: highFeesUrl,
          web: highFeesUrl,
          macos: highFeesUrl
        },
        type: 'EMERGENCY'
      }]
    }
    return announcement
  }, [])

  const _getDexStabilization = async (tokenA: DexStabilizationTokenA, tokenB: DexStabilizationTokenB): Promise<DexStabilization> => {
    let _dexStabilization: DexStabilization = {
      dexStabilizationType: 'none',
      pair: {
        tokenADisplaySymbol: '',
        tokenBDisplaySymbol: ''
      }
    }

    if (tokenA !== undefined && tokenB !== undefined) {
      const { bestPath } = await getBestPath(
        tokenA.id === '0_unified' ? '0' : tokenA.id,
        tokenB.id === '0_unified' ? '0' : tokenB.id)

      /*
        Direct swap - checking the length is impt because when the pair is disabled, then the path used will be different
      */
      if (
        bestPath.length === 1 && (
          (tokenA.displaySymbol === 'DUSD' && tokenB.displaySymbol === 'DFI') ||
          (tokenA.displaySymbol === 'DUSD' && tokenB.displaySymbol === 'dUSDT') ||
          (tokenA.displaySymbol === 'DUSD' && tokenB.displaySymbol === 'dUSDC'))) {
        _dexStabilization = {
          dexStabilizationType: 'direct-dusd-with-fee',
          pair: {
            tokenADisplaySymbol: tokenA.displaySymbol,
            tokenBDisplaySymbol: tokenB.displaySymbol
          }
        }
      }

      const dUSDandDFIPairIndex = bestPath.findIndex(path => {
        return (path.tokenA.displaySymbol === 'DUSD' && path.tokenB.displaySymbol === 'DFI') ||
          (path.tokenA.displaySymbol === 'DFI' && path.tokenB.displaySymbol === 'DUSD')
      })
      const dUSDandUSDTPairIndex = bestPath.findIndex(path => {
        return (path.tokenA.displaySymbol === 'DUSD' && path.tokenB.displaySymbol === 'dUSDT') ||
          (path.tokenA.displaySymbol === 'dUSDT' && path.tokenB.displaySymbol === 'DUSD')
      })
      const dUSDandUSDCPairIndex = bestPath.findIndex(path => {
        return (path.tokenA.displaySymbol === 'DUSD' && path.tokenB.displaySymbol === 'dUSDC') ||
          (path.tokenA.displaySymbol === 'dUSDC' && path.tokenB.displaySymbol === 'DUSD')
      })

      /*
        Otherwise, check for composite swap
          1. Get index of DUSD-(DFI | USDT | USDC) pair
          2. If index === 0 Check if first leg in best path is DUSD-(DFI | USDT | USDC) and second leg is (DFI | USDT | USDC) respectively
          3. Else check if the previous pair tokenB is DUSD to ensure that the direction of DUSD-DFI is DUSD -> DFI | USDT | USDC
      */
      if (
        (dUSDandDFIPairIndex === 0 && (bestPath[dUSDandDFIPairIndex + 1]?.tokenA.displaySymbol === 'DFI' || bestPath[dUSDandDFIPairIndex + 1]?.tokenB.displaySymbol === 'DFI')) ||
        (dUSDandDFIPairIndex !== -1 && bestPath[dUSDandDFIPairIndex - 1]?.tokenB.displaySymbol === 'DUSD')) {
        _dexStabilization = {
          dexStabilizationType: 'composite-dusd-with-fee',
          pair: {
            tokenADisplaySymbol: 'DUSD',
            tokenBDisplaySymbol: 'DFI'
          }
        }
      } else if (
        (dUSDandUSDTPairIndex === 0 && (bestPath[dUSDandUSDTPairIndex + 1]?.tokenA.displaySymbol === 'dUSDT' || bestPath[dUSDandUSDTPairIndex + 1]?.tokenB.displaySymbol === 'dUSDT')) ||
        (dUSDandUSDTPairIndex !== -1 && bestPath[dUSDandUSDTPairIndex - 1]?.tokenB.displaySymbol === 'DUSD')) {
        _dexStabilization = {
          dexStabilizationType: 'composite-dusd-with-fee',
          pair: {
            tokenADisplaySymbol: 'DUSD',
            tokenBDisplaySymbol: 'dUSDT'
          }
        }
      } else if (
        (dUSDandUSDCPairIndex === 0 && (bestPath[dUSDandUSDCPairIndex + 1]?.tokenA.displaySymbol === 'dUSDC' || bestPath[dUSDandUSDCPairIndex + 1]?.tokenB.displaySymbol === 'dUSDC')) ||
        (dUSDandUSDCPairIndex !== -1 && bestPath[dUSDandUSDCPairIndex - 1]?.tokenB.displaySymbol === 'DUSD')) {
        _dexStabilization = {
          dexStabilizationType: 'composite-dusd-with-fee',
          pair: {
            tokenADisplaySymbol: 'DUSD',
            tokenBDisplaySymbol: 'dUSDC'
          }
        }
      }
    }
    return _dexStabilization
  }

  return {
    dexStabilizationAnnouncement: swapAnnouncement,
    dexStabilization
  }
}
