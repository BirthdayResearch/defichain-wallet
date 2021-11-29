import { NextApiRequest, NextApiResponse } from 'next'
import { AnnouncementData } from '@shared-types/website'
import Cors from 'cors'
import { runMiddleware } from '../../../utils/middleware'

export const cors = Cors({
  methods: ['GET', 'HEAD']
})

export default async function handle (req: NextApiRequest, res: NextApiResponse<AnnouncementData[]>): Promise<void> {
  await runMiddleware(req, res, cors)
  res.json([{
    lang: {
      en: 'Decentralized loan is now available on the Light Wallet app.',
      de: 'Dezentrale Darlehen sind jetzt in der Light Wallet App verfügbar.',
      'zh-Hans': '去中心化贷款已在清钱包 Light Wallet 正式推出',
      'zh-Hant': '去中心化貸款已在清錢包 Light Wallet 正式推出'
    },
    version: '>=0.12.0'
  }])
}
