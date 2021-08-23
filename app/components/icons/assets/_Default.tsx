import * as React from 'react'
import randomColor from 'randomcolor'
import { tailwind } from '../../../tailwind'

export function _Default (symbol: string): (props: React.SVGProps<SVGSVGElement>) => JSX.Element {
  return (props: React.SVGProps<SVGSVGElement>): JSX.Element => {
    const { style } = props
    const height = '32px'
    const width = '32px'
    const bg = randomColor({ luminosity: 'bright', format: 'rgba', seed: symbol, alpha: 0.2 })
    const text = randomColor({ luminosity: 'dark', format: 'rgba', seed: symbol, alpha: 100 })
    const first = symbol?.substring(0, 1)

    return (
      <div style={{ height, width, ...style }}>
        <div style={{ backgroundColor: bg, ...tailwind('rounded-full w-full h-full') }}>
          <div style={tailwind('w-full h-full flex items-center')}>
            <div style={{ color: text, ...tailwind('flex-1 w-1 text-center font-semibold') }}>{first}</div>
          </div>
        </div>
      </div>
    )
  }
}
