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
      en: 'Stock Split: dAMZN will be locked on 6 June from 1030hrs to 1630hrs UTC',
      de: 'Aktiensplit: dAMZN wird am 6. Juni von 10.30 Uhr bis 16.30 Uhr UTC gesperrt sein.',
      'zh-Hans': '股票拆分： dMZN 将于 6 月 6 日 10:30 时至 1630 时 UTC 锁定',
      'zh-Hant': '股票拆分： dMZN 將於 6 月 6 日 10:30 時至 1630 時 UTC 鎖定',
      fr: 'Le fractionnement de l\'action : dAMZN sera bloqué le 6 juin de 10h30 à 16h30 UTC',
      es: 'Division de acciones: dMZN será bloqueado el 6 de Junio desde las 10:30h hasta las 16:h UTC',
      it: 'Stock Split: dAMZN will be locked on 6 June from 1030hrs to 1630hrs UTC'
    },
    version: '>=1.12.3',
    id: '8',
    type: 'OTHER_ANNOUNCEMENT'
  },
  {
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
    type: 'OTHER_ANNOUNCEMENT'
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
