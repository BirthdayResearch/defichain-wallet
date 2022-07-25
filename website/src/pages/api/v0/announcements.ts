import { NextApiRequest, NextApiResponse } from 'next'
import { AnnouncementData } from '@shared-types/website'
import Cors from 'cors'
import { runMiddleware } from '../../../utils/middleware'

export const cors = Cors({
  methods: ['GET', 'HEAD']
})

export default async function handle (req: NextApiRequest, res: NextApiResponse<AnnouncementData[]>): Promise<void> {
  await runMiddleware(req, res, cors)
  res.json([
    {
      lang: {
        en: 'There is currently a high DEX stabilization fee imposed on DUSD-DFI swaps due to DFIP 2206-D.',
        de: 'Derzeit wird eine hohe DEX-Stabilisierungsgebühr bei Tausch von DUSD-DFI aufgrund von DFIP 2206-D erhoben.',
        'zh-Hans': '由于社区提案 DFIP 2206-D，目前对 DUSD - DFI 兑换征收高额的 Dex 稳定费。',
        'zh-Hant': '由於社區提案 DFIP 2206-D，目前對 DUSD - DFI 兌換徵收高額的 Dex 穩定費。',
        fr: 'Il existe actuellement une taxe de stabilisation du DEX élevée imposée sur les échanges DUSD-DFI en raison du DFIP 2206-D.',
        es: 'There is currently a high DEX Stabilization fee imposed on DUSD-DFI swaps due to DFIP 2206-D.',
        it: 'There is currently a high DEX Stabilization fee imposed on DUSD-DFI swaps due to DFIP 2206-D.'
      },
      version: '<=1.16.0',
      type: 'OTHER_ANNOUNCEMENT',
      id: '11',
      url: {
        ios: 'https://blog.defichain.com/dex-stabilization-fee/',
        android: 'https://blog.defichain.com/dex-stabilization-fee/',
        web: 'https://blog.defichain.com/dex-stabilization-fee/',
        windows: 'https://blog.defichain.com/dex-stabilization-fee/',
        macos: 'https://blog.defichain.com/dex-stabilization-fee/'
      }
    },
    {
      lang: {
        en: 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.',
        de: 'Auf DUSD-DFI-, DUSD-USDT- und DUSD-USDC-Tauschgeschäfte wird derzeit eine hohe DEX-Stabilisierungsgebühr aufgrund von DFIP 2206-D und DFIP 2207-B erhoben.',
        'zh-Hans': 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.',
        'zh-Hant': 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.',
        fr: 'Il y a actuellement des frais de stabilisation DEX élevés imposés sur les échanges DUSD-DFI, DUSD-USDT, et DUSD-USDC en raison de DFIP 2206-D et DFIP 2207-B.',
        es: 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.',
        it: 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.'
      },
      version: '>=100.0.0',
      type: 'SCAN',
      id: '12',
      url: {
        ios: 'https://blog.defichain.com/dex-stabilization-fee/',
        android: 'https://blog.defichain.com/dex-stabilization-fee/',
        web: 'https://blog.defichain.com/dex-stabilization-fee/',
        windows: 'https://blog.defichain.com/dex-stabilization-fee/',
        macos: 'https://blog.defichain.com/dex-stabilization-fee/'
      }
    },
    {
      lang: {
        en: 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.',
        de: 'Auf DUSD-DFI-, DUSD-USDT- und DUSD-USDC-Tauschgeschäfte wird derzeit eine hohe DEX-Stabilisierungsgebühr aufgrund von DFIP 2206-D und DFIP 2207-B erhoben.',
        'zh-Hans': 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.',
        'zh-Hant': 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.',
        fr: 'Il y a actuellement des frais de stabilisation DEX élevés imposés sur les échanges DUSD-DFI, DUSD-USDT, et DUSD-USDC en raison de DFIP 2206-D et DFIP 2207-B.',
        es: 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.',
        it: 'There is currently a high DEX stabilization fee imposed on DUSD-DFI, DUSD-USDT, and DUSD-USDC swaps due to DFIP 2206-D and DFIP 2207-B.'
      },
      version: '>=1.16.1',
      type: 'OTHER_ANNOUNCEMENT',
      id: '13',
      url: {
        ios: 'https://blog.defichain.com/dex-stabilization-fee/',
        android: 'https://blog.defichain.com/dex-stabilization-fee/',
        web: 'https://blog.defichain.com/dex-stabilization-fee/',
        windows: 'https://blog.defichain.com/dex-stabilization-fee/',
        macos: 'https://blog.defichain.com/dex-stabilization-fee/'
      }
    }
  ])
}
