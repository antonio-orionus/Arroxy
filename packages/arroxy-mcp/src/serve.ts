import {StdioServerTransport} from '@modelcontextprotocol/server/stdio'
import type {ArroxyClient} from './client'
import {createArroxyMcpServer} from './tools'

// Serves MCP on stdin/stdout until the client closes the stream. It starts and
// lists its tools while Arroxy is closed; each tool call looks for the app anew.
export async function serveStdio(client: ArroxyClient): Promise<void> {
	const server = createArroxyMcpServer(client)
	const closed = new Promise<void>(resolve => {
		server.server.onclose = () => resolve()
	})
	await server.connect(new StdioServerTransport())
	await closed
}
