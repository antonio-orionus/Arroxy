// @vitest-environment jsdom
import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vite-plus/test'
import {FilenameTemplateField} from '@renderer/components/shared/FilenameTemplateField.js'

function renderField(value: string): void {
	render(<FilenameTemplateField value={value} onChange={() => {}} error={null} label="Filename template" description="" />)
}

describe('FilenameTemplateField', () => {
	// Playlist sync and .m3u find files by `[<id>]` right before the extension.
	it('warns when {id} is in the name but not as the [{id}] ending', () => {
		renderField('{id} - {title}')
		expect(screen.getByTestId('filename-template-id-warning')).toHaveTextContent('End the name with [{id}] so Arroxy can detect already-downloaded playlist items and generate .m3u playlists.')
	})

	it('does not warn for a name ending in [{id}]', () => {
		renderField('{title} [{id}]')
		expect(screen.queryByTestId('filename-template-id-warning')).toBeNull()
	})
})
