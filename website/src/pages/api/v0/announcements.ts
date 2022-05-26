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
      en: 'An update is available. Download now.',
      de: 'Ein Update ist verfügbar. Jetzt herunterladen.',
      'zh-Hans': '已有新版本。请立即更新。',
      'zh-Hant': '已有新版本。請立即更新。',
      fr: 'Une mise à jour est disponible. Téléchargez maintenant.',
      es: 'Hay una actualización disponible. Descargar ahora.',
      it: 'È disponibile un update. Scaricalo ora.'
    },
    version: '<1.11.0',
    id: '5',
    type: 'OTHER_ANNOUNCEMENT',
    url: {
      ios: 'https://apps.apple.com/us/app/defichain-wallet/id1572472820',
      android: 'https://play.google.com/store/apps/details?id=com.defichain.app',
      web: '',
      windows: '',
      macos: ''
    }
  }])
}
