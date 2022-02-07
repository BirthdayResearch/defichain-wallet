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
      en: 'Fort Canning Hill is officially live! Update to the latest app version to experience key upgrades such as paying back DUSD loan with DFI.',
      de: 'Fort Canning Hill is officially live! Update to the latest app version to experience key upgrades such as paying back DUSD loan with DFI.',
      'zh-Hans': 'Fort Canning Hill is officially live! Update to the latest app version to experience key upgrades such as paying back DUSD loan with DFI.',
      'zh-Hant': 'Fort Canning Hill is officially live! Update to the latest app version to experience key upgrades such as paying back DUSD loan with DFI.',
      fr: 'Fort Canning Hill is officially live! Update to the latest app version to experience key upgrades such as paying back DUSD loan with DFI.'
    },
    version: '<=1.1.0',
    id: '3',
    url: {
      ios: 'https://apps.apple.com/us/app/defichain-wallet/id1572472820',
      android: 'https://play.google.com/store/apps/details?id=com.defichain.app',
      web: '',
      windows: '',
      macos: ''
    }
  }, {
    lang: {
      en: 'Fort Canning Hill is officially live!',
      de: 'Fort Canning Hill is officially live!',
      'zh-Hans': 'Fort Canning Hill is officially live!',
      'zh-Hant': 'Fort Canning Hill is officially live!',
      fr: 'Fort Canning Hill is officially live!'
    },
    version: '>=1.2.0',
    id: '4'
  }])
}
