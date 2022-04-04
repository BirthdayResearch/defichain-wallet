import { BuyRoute, BuyRouteDto, fromBuyRouteDto } from './BuyRoute'
import { fromSellRouteDto, SellRoute, SellRouteDto } from './SellRoute'
import { StakingRoute } from './StakingRoute'

export interface RoutesDto {
  buy: BuyRouteDto[]
  sell: SellRouteDto[]
  staking: StakingRoute[]
}

export interface Routes {
  buy: BuyRoute[]
  sell: SellRoute[]
  staking: StakingRoute[]
}

export const fromRoutesDto = (route: RoutesDto): Routes => ({
  buy: route.buy.map((b) => fromBuyRouteDto(b)),
  sell: route.sell.map((b) => fromSellRouteDto(b)),
  staking: route.staking
})
