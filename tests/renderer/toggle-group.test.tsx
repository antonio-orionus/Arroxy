import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {ToggleGroup, ToggleGroupItem} from '@renderer/components/ui/toggle-group.js'

describe('ToggleGroup', () => {
	it('never lets an item refuse to shrink by default', () => {
		render(
			<ToggleGroup value={['a']}>
				<ToggleGroupItem value="a">Alpha</ToggleGroupItem>
			</ToggleGroup>
		)
		const classes = screen.getByText('Alpha').className.split(' ')
		expect(classes).not.toContain('shrink-0')
		expect(classes).toContain('min-w-0')
	})

	it('never lets the group grow past its parent', () => {
		render(
			<ToggleGroup value={['a']} data-testid="group">
				<ToggleGroupItem value="a">Alpha</ToggleGroupItem>
			</ToggleGroup>
		)
		expect(screen.getByTestId('group').className.split(' ')).toContain('max-w-full')
	})

	it('applies a group-level shape to every item', () => {
		render(
			<ToggleGroup value={['a']} shape="chip" data-testid="group">
				<ToggleGroupItem value="a">Alpha</ToggleGroupItem>
			</ToggleGroup>
		)
		expect(screen.getByTestId('group')).toHaveAttribute('data-shape', 'chip')
		expect(screen.getByText('Alpha').className.split(' ')).toContain('whitespace-nowrap')
	})

	it('lets an item opt into chip shape on its own', () => {
		render(
			<ToggleGroup value={['a']}>
				<ToggleGroupItem value="a" shape="chip">
					Alpha
				</ToggleGroupItem>
			</ToggleGroup>
		)
		expect(screen.getByText('Alpha').className.split(' ')).toContain('whitespace-nowrap')
	})
})
