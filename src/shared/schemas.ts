import { z } from 'zod';

const youtubeHostRegex = /(^|\.)(youtube\.com|youtu\.be)$/i;

export const youtubeUrlSchema = z
  .string()
  .url('URL must be valid')
  .superRefine((value, ctx) => {
    try {
      const parsed = new URL(value);
      if (!youtubeHostRegex.test(parsed.hostname)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Only YouTube URLs are supported' });
      }
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'URL parsing failed' });
    }
  });

export const getFormatsSchema = z.object({
  url: youtubeUrlSchema
});

export const startDownloadSchema = z.object({
  url: youtubeUrlSchema,
  outputDir: z.string().min(1).optional(),
  formatId: z.string().min(1).optional(),
  subtitleLanguages: z.array(z.string().min(2).max(15)).optional(),
  writeAutoSubs: z.boolean().optional()
});

export const cancelDownloadSchema = z.object({
  jobId: z.string().optional()
});

export const pauseResumeSchema = z.object({
  jobId: z.string().optional()
});

export const updateSettingsSchema = z.object({
  defaultOutputDir: z.string().min(1).optional(),
  rememberLastOutputDir: z.boolean().optional(),
  lastVideoResolution: z.string().optional(),
  lastPreset: z.enum(['best-quality', 'balanced', 'audio-only', 'small-file']).nullable().optional(),
  uiZoom: z.number().min(0.7).max(1.5).optional(),
  uiTheme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'ru', 'uk', 'ja', 'zh', 'hi']).optional(),
  lastSubtitleLanguages: z.array(z.string()).optional()
});
