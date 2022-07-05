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
        de: 'Derzeit wird eine hohe Dex-Stabilisierungsgebühr bei Tausch von DUSD-DFI aufgrund von DFIP 2206-D erhoben.',
        'zh-Hans': '由于社区提案 DFIP 2206-D，目前对 DUSD - DFI 兑换征收高额的 Dex 稳定费。',
        'zh-Hant': '由於社區提案 DFIP 2206-D，目前對 DUSD - DFI 兌換徵收高額的 Dex 穩定費。',
        fr: 'Il existe actuellement une taxe de stabilisation du DEX élevée imposée sur les échanges DUSD-DFI en raison du DFIP 2206-D.',
        es: 'There is currently a high DEX Stabilization fee imposed on DUSD-DFI swaps due to DFIP 2206-D.',
        it: 'There is currently a high DEX Stabilization fee imposed on DUSD-DFI swaps due to DFIP 2206-D.'
      },
      version: '>=1.0.0',
      type: 'OTHER_ANNOUNCEMENT',
      id: '10',
      url: {
        ios: 'https://github.com/DeFiCh/dfips/issues/165',
        android: 'https://github.com/DeFiCh/dfips/issues/165',
        web: 'https://github.com/DeFiCh/dfips/issues/165',
        windows: 'https://github.com/DeFiCh/dfips/issues/165',
        macos: 'https://github.com/DeFiCh/dfips/issues/165'
      }
    }
  ])
}
