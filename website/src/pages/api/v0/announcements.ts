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
      en: 'Decentralized loan is coming to the Light Wallet app in one week\'s time!',
      de: 'Die dezentrale Darlehensvergabe wird in einer Woche in der Light Wallet App verfügbar sein!',
      'zh-Hans': '去中心化贷款即将登陆轻钱包应用程序',
      'zh-Hant': '去中心化貸款即將登陸輕錢包應用程序'
    },
    version: '>=0.12.0'
  }])
}
