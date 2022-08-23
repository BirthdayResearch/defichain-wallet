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
        en: 'It\'s DeFiChain Wallet\'s 1st year birthday! See how the earlier days of DeFiChain Wallet looked like.',
        de: 'Die DeFiChain Wallet wird 1 Jahr alt! Sieh dir an, wie die früheren Tage von DeFiChain Wallet aussahen.',
        'zh-Hans': 'DeFiChain 钱包刚满一周岁生日! 看看早期的 DeFiChain 钱包是怎样。',
        'zh-Hant': 'DeFiChain 錢包剛滿一周歲生日! 看看早期的 DeFiChain 錢包是怎樣。',
        fr: 'C\'est l\'anniversaire des 1 an du portefeuille DeFiChain ! Regarde à quoi ressemblaient les premiers jours du portefeuille DeFiChain.',
        es: 'It\'s DeFiChain Wallet\'s 1st year birthday! See how the earlier days of DeFiChain Wallet looked like.',
        it: 'It\'s DeFiChain Wallet\'s 1st year birthday! See how the earlier days of DeFiChain Wallet looked like.'
      },
      version: '>=1.16.1',
      type: 'OTHER_ANNOUNCEMENT',
      id: '14',
      url: {
        ios: 'https://medium.com/@birthdayresearch/happy-1st-birthday-to-the-defichain-light-wallet-d753704b65c2',
        android: 'https://medium.com/@birthdayresearch/happy-1st-birthday-to-the-defichain-light-wallet-d753704b65c2',
        web: 'https://medium.com/@birthdayresearch/happy-1st-birthday-to-the-defichain-light-wallet-d753704b65c2',
        windows: 'https://medium.com/@birthdayresearch/happy-1st-birthday-to-the-defichain-light-wallet-d753704b65c2',
        macos: 'https://medium.com/@birthdayresearch/happy-1st-birthday-to-the-defichain-light-wallet-d753704b65c2'
      }
    }
  ])
}
