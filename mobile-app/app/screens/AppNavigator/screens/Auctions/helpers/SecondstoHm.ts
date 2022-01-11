import { translate } from '@translations'
import { padStart } from 'lodash'

function secondsToHm (d: number): {h: number, m: number} {
  return {
    h: Math.floor(d / 3600),
    m: Math.floor(d % 3600 / 60)
  }
}

export function secondsToHmDisplay (d: number): string {
    const { h, m } = secondsToHm(d)
    const hDisplay = h > 0 ? `${translate('components/BatchCard', '{{h}}h', { h })} ` : ''
    const mDisplay = m >= 0 ? translate('components/BatchCard', '{{m}}m', { m: h > 0 ? padStart(m.toString(), 2, '0') : m }) : ''
    return `${hDisplay}${mDisplay}`
  }

export function secondsToTimeAgo (d: number): string {
  const { h, m } = secondsToHm(d)
  const hDisplay = h > 0 ? `${translate('components/BatchCard', '{{h}}h', { h })} ` : ''
  const mDisplay = m >= 0 ? translate('components/BatchCard', '{{m}}m', { m: h > 0 ? padStart(m.toString(), 2, '0') : m }) : ''
  return translate('components/BidHistory', '{{h}}{{m}} ago', { h: hDisplay, m: mDisplay })
}
