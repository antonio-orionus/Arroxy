#!/usr/bin/env node
import {randomUUID} from 'node:crypto'
import {runCli} from './cli-run'
import {ArroxyClient} from './client'
import {processEnvironment} from './environment'
import {serveStdio} from './serve'

// stdout carries MCP in serve mode, so diagnostics only ever go to stderr.
const client = new ArroxyClient({environment: processEnvironment(), log: line => process.stderr.write(`${line}\n`)})

process.exitCode = await runCli(process.argv.slice(2), {client, stdout: text => void process.stdout.write(text), stderr: text => void process.stderr.write(text), serve: () => serveStdio(client), newRequestId: randomUUID})
