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
      en: 'We are currently investigating an issue with the Masternodes.',
      de: 'Wir untersuchen derzeit ein Problem mit den Masternodes.',
      'zh-Hans': 'We are currently investigating an issue with the Masternodes.',
      'zh-Hant': 'We are currently investigating an issue with the Masternodes.'
    },
    version: '>0.15.0'
  }])
}
