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
      en: 'Future Swap is now available!',
      de: 'Future Swap ist jetzt verfügbar!',
      'zh-Hans': '未来兑换功能现已推出！',
      'zh-Hant': '未來兌換功能現已推出！',
      fr: 'Future Swap: Échange à terme est maintenant disponible !',
      es: 'El intercambio a futuro está ahora disponible!',
      it: 'Future Swap è ora disponibile!'
    },
    version: '>=1.12.3',
    id: '6',
    type: 'OTHER_ANNOUNCEMENT',
    url: {
      ios: 'https://apps.apple.com/us/app/defichain-wallet/id1572472820',
      android: 'https://play.google.com/store/apps/details?id=com.defichain.app',
      web: '',
      windows: '',
      macos: ''
    }
  },
  {
    lang: {
      en: 'Future Swap is now available! Update to the latest app version to access.',
      de: 'Future Swap ist jetzt verfügbar! Aktualisiere auf die neueste Version der App, um darauf zuzugreifen.',
      'zh-Hans': '未来兑换功能现已推出！可前往下载最新版本参与体验。',
      'zh-Hant': '未來兌換功能現已推出！可前往下載最新版本參與體驗。\n',
      fr: 'Future Swap: Échange à terme est maintenant disponible ! Passez à la dernière version de l\'application pour y accéder.',
      es: 'El intercambio a futuro esta ahora disponible! Actualiza la app a su ultima versión para acceder.',
      it: 'Future Swap è ora disponibile! Aggiorna l\'ultima versione dell\'app per accedere.'
    },
    version: '<1.12.3',
    id: '7',
    type: 'OTHER_ANNOUNCEMENT',
    url: {
      ios: 'https://apps.apple.com/us/app/defichain-wallet/id1572472820',
      android: 'https://play.google.com/store/apps/details?id=com.defichain.app',
      web: '',
      windows: '',
      macos: ''
    }
  }
  ])
}
