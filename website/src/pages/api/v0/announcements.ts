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
      en: 'We are currently investigating a sync issue between the blockchain and the interface on the apps. This is only a display issue, and does not affect the balances in the wallet.',
      de: 'Wir untersuchen derzeit ein Synchronisationsproblem zwischen der Blockchain und der Schnittstelle der Apps. Dies ist nur ein Anzeigeproblem und hat keine Auswirkungen auf die Guthaben in der Wallet.',
      'zh-Hans': '我們目前正在調查區塊鏈與應用程序界面之間的同步問題。這只是一個顯示問題，並不影響錢包中的餘額。',
      'zh-Hant': '我们目前正在调查区块链与应用程序界面之间的同步问题。这只是一个显示问题，并不影响钱包中的余额。'
    },
    version: '<0.20.0'
  }])
}
