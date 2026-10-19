// Hosts a request Arroxy makes on its own (not one the user typed) must never
// reach: the user's machine and local network.

import {BlockList, isIP} from 'node:net'

// Address ranges a fetch must never reach. BlockList also matches IPv4-mapped
// IPv6 forms (::ffff:7f00:1) against the IPv4 rules, which matters because the
// WHATWG URL parser rewrites a dotted [::ffff:127.0.0.1] literal to hex groups.
const BLOCKED_ADDRESSES = new BlockList()
for (const [network, prefix] of [
	['0.0.0.0', 8], // "this" network
	['10.0.0.0', 8], // RFC 1918
	['100.64.0.0', 10], // CGNAT shared space
	['127.0.0.0', 8], // loopback
	['169.254.0.0', 16], // link-local
	['172.16.0.0', 12], // RFC 1918
	['192.168.0.0', 16] // RFC 1918
] as const)
	BLOCKED_ADDRESSES.addSubnet(network, prefix, 'ipv4')
BLOCKED_ADDRESSES.addAddress('::', 'ipv6') // unspecified
BLOCKED_ADDRESSES.addAddress('::1', 'ipv6') // loopback
BLOCKED_ADDRESSES.addSubnet('fc00::', 7, 'ipv6') // unique-local
BLOCKED_ADDRESSES.addSubnet('fe80::', 10, 'ipv6') // link-local

/** True when the host must not be fetched: loopback, private, CGNAT, or link-local ranges (name-level check only, terminal-dot aliases canonicalized). */
export function isPrivateHostname(hostname: string): boolean {
	const host = hostname
		.toLowerCase()
		.replace(/^\[|\]$/g, '')
		.replace(/\.+$/, '')
	if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) return true
	const family = isIP(host)
	if (family === 4) return BLOCKED_ADDRESSES.check(host, 'ipv4')
	if (family === 6) return BLOCKED_ADDRESSES.check(host, 'ipv6')
	return false
}
