// Types for the README build so tests can import its helpers from TypeScript.

export declare function localizeScreenshots(text: string, code: string, exists: (path: string) => boolean): {text: string; missing: string[]}
export declare function rebaseRelativeLinks(text: string, filename: string): string
export declare function isScriptEntry(argv1: string | undefined, moduleUrl: string): boolean
