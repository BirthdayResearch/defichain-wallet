import { NextApiRequest, NextApiResponse } from 'next'
import { FeatureFlag } from '@shared-types/website'
import Cors from 'cors'
import { runMiddleware } from '../../../../utils/middleware'
import { EnvironmentNetwork } from '../../../../../../shared/environment'

export const cors = Cors({
  methods: ['GET', 'HEAD']
})

export default async function handle (req: NextApiRequest, res: NextApiResponse<FeatureFlag[]>): Promise<void> {
  await runMiddleware(req, res, cors)
  res.json([{
    id: 'loan',
    name: 'Loans',
    stage: 'public',
    version: '>=0.17.0',
    description: 'Browse loan tokens provided by DeFiChain',
    networks: [EnvironmentNetwork.MainNet, EnvironmentNetwork.TestNet, EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
    platforms: ['ios', 'android', 'web']
  }, {
    id: 'auction',
    name: 'Auction',
    stage: 'beta',
    version: '>=0.23.0',
    description: 'Browse auctions provided by DeFiChain',
    networks: [EnvironmentNetwork.MainNet, EnvironmentNetwork.TestNet, EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
    platforms: ['ios', 'android', 'web']
  }])
}
