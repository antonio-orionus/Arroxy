// Types for the README build so tests can import its helpers from TypeScript.

export declare function localizeScreenshots(text: string, code: string, exists: (path: string) => boolean): {text: string; missing: string[]}
export declare function rebaseRelativeLinks(text: string, filename: string): string
export declare function isScriptEntry(argv1: string | undefined, moduleUrl: string): boolean
export declare function applyStrings(template: string, strings: Readonly<Record<string, string>>, fallback?: Readonly<Record<string, string>>): string
export declare function missingTemplateKeys(template: string, strings: Readonly<Record<string, string>>, macros: readonly string[]): string[]
