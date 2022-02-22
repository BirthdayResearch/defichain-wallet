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
      de: 'Fort Canning Hill ist offiziell live! Aktualisiere auf die neueste App-Version und erlebe wichtige Neuerungen wie die Rückzahlung von DUSD-Darlehen mit DFI.',
      'zh-Hans': 'Fort Canning Hill 更新正式上线！更新至应用程式最新版本以体验升级，例如使用 DFI 偿还 DUSD 贷款。',
      'zh-Hant': 'Fort Canning Hill 更新正式上線！ 更新至應用程式最新版本以體驗升級，例如使用 DFI 償還 DUSD 貸款。',
      fr: 'Fort Canning Hill est officiellement en ligne ! Passez à la dernière version de l\'application pour profiter de mises à jour importantes, telles que le remboursement du prêt DUSD avec DFI.'
    },
    version: '<=1.1.0',
    id: '3',
    url: {
      ios: 'https://apps.apple.com/us/app/defichain-wallet/id1572472820',
      android: 'https://play.google.com/store/apps/details?id=com.defichain.app',
      web: '',
      windows: '',
      macos: ''
    },
    type: 'OTHER_ANNOUNCEMENT'
  }, {
    lang: {
      en: 'Fort Canning Hill is officially live!',
      de: 'Fort Canning Hill ist offiziell live!',
      'zh-Hans': 'Fort Canning Hill 更新正式上线！',
      'zh-Hant': 'Fort Canning Hill 更新正式上線！',
      fr: 'Fort Canning Hill est officiellement en ligne !'
    },
    version: '>=1.2.0',
    id: '4',
    type: 'OTHER_ANNOUNCEMENT'
  }])
}
