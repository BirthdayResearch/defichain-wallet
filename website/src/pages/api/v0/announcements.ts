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
      en: 'Decentralised loan is coming to the Light Wallet app soon.',
      de: 'Dezentrales Darlehen ist der Light Wallet App bald möglich.',
      'zh-Hans': 'Decentralised loan is coming to the Light Wallet app soon.',
      'zh-Hant': 'Decentralised loan is coming to the Light Wallet app soon.'
    },
    version: '>=0.12.0'
  }])
}
