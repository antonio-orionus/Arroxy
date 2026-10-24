// Types for the README build so tests can import its helpers from TypeScript.

export declare function localizeScreenshots(text: string, code: string, exists: (path: string) => boolean): {text: string; missing: string[]}
export declare function rebaseRelativeLinks(text: string, filename: string): string
export declare function isScriptEntry(argv1: string | undefined, moduleUrl: string): boolean
export declare function applyStrings(template: string, strings: Readonly<Record<string, string>>, fallback?: Readonly<Record<string, string>>): string
export declare function missingTemplateKeys(template: string, strings: Readonly<Record<string, string>>, macros: readonly string[]): string[]
export declare function readmeOpenKeys(enStrings: Readonly<Record<string, string>>, localeStrings: Readonly<Record<string, string>>, translatedFrom: Readonly<Record<string, string>>): string[]
export declare const TRANSLATED_FROM_PATH: string
export declare function readTranslatedFrom(): Record<string, string>
export declare function untranslatedEnglishChanges(enStrings: Readonly<Record<string, string>>, translatedFrom: Readonly<Record<string, string>>): {changed: string[]; added: string[]; removed: string[]}
export declare const STAMP_TOKEN: string
export declare function resolveStamp(rendered: string, previous: string | null, today?: string): {date: string; changed: boolean}
