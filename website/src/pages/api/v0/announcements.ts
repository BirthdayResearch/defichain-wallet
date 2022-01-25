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
      en: 'Update to the latest app version to access Auctions.',
      de: 'Aktualisiere auf die neueste App-Version, um Zugriff auf Auktionen zu bekommen.',
      'zh-Hans': '请即更新至最新应用程式版本以体验拍卖功能',
      'zh-Hant': '請即更新至最新應用程式版本以體驗拍賣功能',
      fr: 'Update to the latest app version to access Auctions.'
    },
    version: '<=0.22.0',
    id: '0'
  }, {
    lang: {
      en: 'Auctions are now accessible from the bottom menu bar.',
      de: 'Auktionen lassen jetzt über die untere Menüleiste aufrufen.',
      'zh-Hans': '现在可以从页面下方目录栏点击拍卖',
      'zh-Hant': '現在可以從頁面下方目錄欄點擊拍賣',
      fr: 'Auctions are now accessible from the bottom menu bar.'
    },
    version: '>=0.23.0',
    id: '1'
  }])
}
