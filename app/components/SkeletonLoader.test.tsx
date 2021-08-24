import * as React from 'react'
import { render } from "@testing-library/react-native"
import { SkeletonLoader, SkeletonLoaderScreen } from './SkeletonLoader'

const skeletonLoaders = [
	{
		row: 3,
		screen: SkeletonLoaderScreen.Dex
	},
	{
		row: 3,
		screen: SkeletonLoaderScreen.Transaction
	}
]

describe('skeleton loader', () => {
	skeletonLoaders.forEach(loader => {
		it(`should render all skeleton loader for ${loader.screen}`, async() => {
			const renderer = render(
				<SkeletonLoader row={loader.row} screen={loader.screen}/>
			)
			expect(renderer.toJSON()).toMatchSnapshot()
		})
	})
	
})
