import { NextApiRequest, NextApiResponse } from 'next'
import { AnnouncementData, AnnouncementText } from '@shared-types/website'
import Cors from 'cors'

const cors = Cors({
  methods: ['GET', 'HEAD']
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
async function runMiddleware (req: NextApiRequest, res: NextApiResponse, fn: any): Promise<any> {
  return await new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export function createAnnouncement (lang: AnnouncementText, minVersion: string, maxVersion?: string): AnnouncementData {
  return {
    lang,
    version: {
      min: minVersion,
      max: maxVersion
    }
  }
}

export default async function handle (req: NextApiRequest, res: NextApiResponse<AnnouncementData[]>): Promise<void> {
  // TODO(wallet-team): https://nextjs.org/docs/api-routes/introduction
  await runMiddleware(req, res, cors)
  res.status(200).json([
    createAnnouncement({
      en: 'Guidelines',
      de: 'Richtlinien',
      'zh-Hans': '指导方针',
      'zh-Hant': '指導方針'
    }, '0.0.0', '0.12.0'),
    createAnnouncement({
      en: 'Refresh',
      de: 'Erneuern',
      'zh-Hans': '刷新',
      'zh-Hant': '刷新'
    }, '0.12.1')
  ])
}
