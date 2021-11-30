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
      en: 'Update to the latest app version to access Decentralized Loan.',
      de: 'Aktualisiere auf die neueste Version der App, um Zugang zu dezentralen Darlehen zu erhalten.',
      'zh-Hans': '请更新至最新版本应用程式使用去中心化贷款。',
      'zh-Hant': '請更新至最新版本應用程式使用去中心化貸款。'
    },
    version: '<0.17.0',
    url: {
      ios: '',
      android: '',
      web: ''
    }
  }, {
    lang: {
      en: 'Decentralized loan is now available on the Light Wallet app.',
      de: 'Dezentrale Darlehen sind jetzt in der Light Wallet App verfügbar.',
      'zh-Hans': '去中心化贷款已在清钱包 Light Wallet 正式推出',
      'zh-Hant': '去中心化貸款已在清錢包 Light Wallet 正式推出'
    },
    version: '>=0.17.0',
    url: {
      ios: 'https://apps.apple.com/us/app/defichain-wallet/id1572472820',
      android: 'https://play.google.com/store/apps/details?id=com.defichain.app',
      web: 'https://play.google.com/store/apps/details?id=com.defichain.app'
    }
  }])
}
