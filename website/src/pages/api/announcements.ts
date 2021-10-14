import { NextApiRequest, NextApiResponse } from 'next'

interface AnnouncementData {
  en: string
  de: string
  'zh-Hans': string
  'zh-Hant': string
}

export default function handle (req: NextApiRequest, res: NextApiResponse<AnnouncementData>): void {
  // TODO(wallet-team): https://nextjs.org/docs/api-routes/introduction
  const announcement: AnnouncementData = {
    en: 'Guidelines',
    de: 'Richtlinien',
    'zh-Hans': '指导方针',
    'zh-Hant': '指導方針'
  }
  res.status(200).json(announcement)
}
