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
      en: 'Fort Canning Road upgrade is live!',
      de: 'Fort Canning Road ist offiziell live!',
      'zh-Hans': 'Fort Canning Road 更新正式上线！',
      'zh-Hant': 'Fort Canning Road 更新正式上線！',
      fr: 'Fort Canning Road est officiellement en ligne !'
    },
    version: '>=1.2.0',
    id: '4',
    type: 'OTHER_ANNOUNCEMENT'
  }])
}
