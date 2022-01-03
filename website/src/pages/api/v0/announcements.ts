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
      en: 'We are currently fixing a syncing issue on the blockchain.',
      de: 'Wir beheben derzeit ein Synchronisierungsproblem der Blockchain.',
      'zh-Hans': '目前正在修复区块链上的同步化问题',
      'zh-Hant': '目前正在修復區塊鏈上的同步化問題'
    },
    version: '>0.15.0'
  }])
}
