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
      'zh-Hans': 'We are currently investigating a sync issue between the blockchain and the interface on the apps. This is only a display issue, and does not affect the balances in the wallet.',
      'zh-Hant': 'We are currently investigating a sync issue between the blockchain and the interface on the apps. This is only a display issue, and does not affect the balances in the wallet.'
    },
    version: '<0.20.0'
  }])
}
