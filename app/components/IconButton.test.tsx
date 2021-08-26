import * as React from 'react'
import { render } from '@testing-library/react-native'
import { IconButton } from './IconButton'
import { MaterialIcons } from '@expo/vector-icons'

const buttonName: React.ComponentProps<typeof MaterialIcons>['name'][] = ['swap-vert', 'swap-horiz', 'add', 'remove']

describe('icon button', () => {
	buttonName.forEach(name => {
		it(`should match snapshot of button with ${name} icon`, async() => {
			const onPress = jest.fn()
			const rendered = render(<IconButton testID="test" onPress={onPress} materialIconName={name} iconSize={24} />)
			expect(rendered.toJSON()).toMatchSnapshot()
		})
	})
})
