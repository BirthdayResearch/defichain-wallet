import { render } from '@testing-library/react-native'
import * as React from 'react'
import { AppIcon } from '../AppIcon'
import { FaceIdIcon } from '../FaceIdIcon'
import { TouchIdIcon } from '../TouchIdIcon'
import { getNativeIcon } from './index'

jest.mock('randomcolor', () => jest.fn().mockReturnValue('#ffffff'))

const icons = ['DFI', 'FAKE', 'BCH', 'BTC', 'DOGE', 'ETH', 'LTC', 'USDT', '_UTXO', 'USDC']

describe('token icons', () => {
  icons.forEach(icon => {
    it(`getNativeIcon("${icon}") should get <Icon${icon} /> snapshot`, () => {
      const Icon = getNativeIcon(icon)
      const tree = render(<Icon />).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  it(`<AppIcon /> should match snapshot`, () => {
    const tree = render(<AppIcon />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it(`<FaceIdIcon /> should match snapshot`, () => {
    const tree = render(<FaceIdIcon />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it(`<TouchIdIcon /> should match snapshot`, () => {
    const tree = render(<TouchIdIcon />).toJSON()
    expect(tree).toMatchSnapshot()
  })
});
