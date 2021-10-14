import { NextApiRequest, NextApiResponse } from 'next'
import { AnnouncementData, AnnouncementText } from '@shared-types/website'

export function createAnnouncement (lang: AnnouncementText, minVersion: string, maxVersion?: string): AnnouncementData {
  return {
    lang,
    version: {
      min: minVersion,
      max: maxVersion
    }
  }
}

export default function handle (req: NextApiRequest, res: NextApiResponse<AnnouncementData[]>): void {
  // TODO(wallet-team): https://nextjs.org/docs/api-routes/introduction
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
