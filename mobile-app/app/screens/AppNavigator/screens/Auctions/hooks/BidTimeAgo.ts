import { secondsToTimeAgo } from '../helpers/SecondstoHm'

export function useBidTimeAgo (bidTime: number): string {
    const blockTimeinSec = ((new Date().valueOf()) - new Date(bidTime * 1000).valueOf()) / 1000
    return secondsToTimeAgo(blockTimeinSec)
}
