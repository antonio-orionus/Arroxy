import { useId, useState, type JSX, type ReactNode } from 'react';
import { Archive, BookOpen, Captions, ChevronDown, Clapperboard, Download, FileAudio, Film, Folder, Headphones, Info, Music, Plus, Scissors, X, type LucideIcon } from 'lucide-react';
import { DEFAULTS } from '@shared/constants.js';
import { DEFAULT_AUDIO_BITRATE, DOWNLOAD_PROFILE_ICONS } from '@shared/schemas.js';
import type { DownloadProfile, DownloadProfileIcon } from '@shared/types.js';
import { isValidSubfolder, safeFolderName } from '@shared/subfolder.js';
import { cn } from '@renderer/lib/utils.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';
import { Checkbox } from '../ui/checkbox.js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.js';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '../ui/field.js';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../ui/input-group.js';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js';
import { ScrollArea } from '../ui/scroll-area.js';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select.js';
import { Switch } from '../ui/switch.js';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group.js';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js';

type ProfileMediaMode = 'video-audio' | 'video-only' | 'audio-only' | 'subtitles-only';
type ProfileCodec = 'best' | 'mp4';
type ProfileResolution = 'best' | '2160' | '1440' | '1080' | '720' | '480' | '360';
type ProfileAudioFormat = 'best' | 'mp3' | 'm4a' | 'opus' | 'wav';
type ProfileAudioQuality = 'best' | '320' | '192' | '128';
type ProfileSubtitleDelivery = 'sidecar' | 'embed' | 'subfolder';
type ProfileSubtitleFormat = 'srt' | 'vtt' | 'ass';
type ProfileSubtitleSource = 'manual-first' | 'manual-only' | 'auto-only';
type ProfileSponsorBlockMode = 'off' | 'mark' | 'remove';
type ProfilePlaylistCap = 'confirm' | '100' | '250' | '500' | '1000';

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

const MEDIA_MODES: { value: ProfileMediaMode; label: string; description: string; icon: LucideIcon }[] = [
  { value: 'video-audio', label: 'Video + audio', description: 'Normal video files', icon: Film },
  { value: 'video-only', label: 'Video, no audio', description: 'Silent video only', icon: Scissors },
  { value: 'audio-only', label: 'Audio only', description: 'Music or podcasts', icon: FileAudio },
  { value: 'subtitles-only', label: 'Subs only', description: 'Caption files only', icon: Captions }
];

const PROFILE_ICON_META: Record<DownloadProfileIcon, { label: string; icon: LucideIcon }> = {
  download: { label: 'Download', icon: Download },
  video: { label: 'Video', icon: Clapperboard },
  captions: { label: 'Captions', icon: Captions },
  audio: { label: 'Audio', icon: FileAudio },
  music: { label: 'Music', icon: Music },
  podcast: { label: 'Podcast', icon: Headphones },
  classes: { label: 'Classes', icon: BookOpen },
  clip: { label: 'Clip', icon: Scissors },
  archive: { label: 'Archive', icon: Archive }
};

const PROFILE_ICON_OPTIONS = DOWNLOAD_PROFILE_ICONS.map((value) => ({ value, ...PROFILE_ICON_META[value] }));

const VIDEO_COMPATIBILITY_OPTIONS: SelectOption<ProfileCodec>[] = [
  { value: 'best', label: 'Best native' },
  { value: 'mp4', label: 'MP4 / Smart TV' }
];

const RESOLUTION_OPTIONS: SelectOption<ProfileResolution>[] = [
  { value: 'best', label: 'Best available' },
  { value: '2160', label: 'Up to 2160p' },
  { value: '1440', label: 'Up to 1440p' },
  { value: '1080', label: 'Up to 1080p' },
  { value: '720', label: 'Up to 720p' },
  { value: '480', label: 'Up to 480p' },
  { value: '360', label: 'Up to 360p' }
];

const AUDIO_FORMAT_OPTIONS: SelectOption<ProfileAudioFormat>[] = [
  { value: 'best', label: 'Best' },
  { value: 'mp3', label: 'MP3' },
  { value: 'm4a', label: 'M4A' },
  { value: 'opus', label: 'Opus' },
  { value: 'wav', label: 'WAV' }
];

const VIDEO_AUDIO_FORMAT_OPTIONS: SelectOption<Extract<ProfileAudioFormat, 'best' | 'm4a'>>[] = [
  { value: 'best', label: 'Best native' },
  { value: 'm4a', label: 'M4A / AAC' }
];

const AUDIO_QUALITY_OPTIONS: SelectOption<ProfileAudioQuality>[] = [
  { value: 'best', label: 'Best available' },
  { value: '320', label: 'Up to 320K' },
  { value: '192', label: 'Up to 192K' },
  { value: '128', label: 'Up to 128K' }
];

const SUBTITLE_DELIVERY_OPTIONS: { value: ProfileSubtitleDelivery; label: string }[] = [
  { value: 'sidecar', label: 'Sidecar' },
  { value: 'embed', label: 'Embed' },
  { value: 'subfolder', label: 'Subfolder' }
];

const SUBTITLE_FORMAT_OPTIONS: { value: ProfileSubtitleFormat; label: string }[] = [
  { value: 'srt', label: 'SRT' },
  { value: 'vtt', label: 'VTT' },
  { value: 'ass', label: 'ASS' }
];

const SUBTITLE_SOURCE_OPTIONS: SelectOption<ProfileSubtitleSource>[] = [
  { value: 'manual-first', label: 'Manual first, then auto' },
  { value: 'manual-only', label: 'Manual only' },
  { value: 'auto-only', label: 'Auto-generated only' }
];

const OUTPUT_OPTION_DESCRIPTIONS = {
  chapters: 'Chapter markers navigable in any modern player.',
  metadata: 'Title, artist, description, and upload date written into the file.',
  description: 'Saves the video description as a .description text file next to the download.',
  thumbnail: 'Saves the thumbnail as a .jpg image file next to the download.'
} as const;

const SPONSOR_BLOCK_OPTIONS: { value: ProfileSponsorBlockMode; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'mark', label: 'Mark' },
  { value: 'remove', label: 'Remove' }
];

const SPONSOR_BLOCK_HINTS: Record<ProfileSponsorBlockMode, string> = {
  off: 'No SponsorBlock — video plays as uploaded.',
  mark: 'Marks sponsor segments as chapters (non-destructive).',
  remove: 'Cuts sponsor segments from the video using FFmpeg.'
};

const PLAYLIST_CAP_OPTIONS: SelectOption<ProfilePlaylistCap>[] = [
  { value: 'confirm', label: 'Confirm when capped' },
  { value: '100', label: 'Load 100 items' },
  { value: '250', label: 'Load 250 items' },
  { value: '500', label: 'Load 500 items' },
  { value: '1000', label: 'Load 1000 items' }
];

const SELECTABLE_TOGGLE_CLASS = 'flex-1 data-[state=on]:border-[var(--brand)] data-[state=on]:bg-[var(--brand-dim)] data-[state=on]:text-[var(--brand)] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]';
const OUTPUT_MODE_CARD_CLASS = 'h-auto min-h-[4.35rem] flex-col gap-1.5 whitespace-normal rounded-lg border border-[var(--border-strong)] px-2 py-2.5 text-center data-[state=on]:border-[var(--brand)] data-[state=on]:bg-[var(--brand-dim)] data-[state=on]:text-[var(--brand)] aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]';

function optionLabel<T extends string>(options: readonly SelectOption<T>[], value: unknown): string {
  const selected = options.find((option) => option.value === value);
  if (selected) return selected.label;
  return typeof value === 'string' ? value : '';
}

function parseLanguageCodes(value: string): string[] {
  return value
    .split(/[\s,]+/)
    .map((code) => code.trim().toLowerCase())
    .filter((code) => /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/.test(code));
}

function bitrateToQuality(bitrateKbps: number | undefined): ProfileAudioQuality {
  if (bitrateKbps === 320) return '320';
  if (bitrateKbps === 128) return '128';
  return bitrateKbps === undefined ? 'best' : '192';
}

function playlistCapToControlValue(cap: DownloadProfile['playlistProbeCap'] | undefined): ProfilePlaylistCap {
  if (cap === 100 || cap === 250 || cap === 500 || cap === 1000) return String(cap) as ProfilePlaylistCap;
  return 'confirm';
}

function initialMediaMode(profile: DownloadProfile | null): ProfileMediaMode {
  return profile?.media.kind ?? 'video-audio';
}

function initialCodec(profile: DownloadProfile | null): ProfileCodec {
  const media = profile?.media;
  return media?.kind === 'video-audio' || media?.kind === 'video-only' ? media.codec : 'mp4';
}

function initialResolution(profile: DownloadProfile | null): ProfileResolution {
  const media = profile?.media;
  return media?.kind === 'video-audio' || media?.kind === 'video-only' ? (media.tiers[0] ?? '1080') : '1080';
}

function initialAudioFormat(profile: DownloadProfile | null): ProfileAudioFormat {
  const media = profile?.media;
  if (media?.kind === 'audio-only') return media.audio.format;
  if (media?.kind === 'video-audio') return media.audio.format;
  return 'm4a';
}

function defaultProfileSubfolderName(name: string): string {
  return safeFolderName(name.trim() || 'Download Profile');
}

function ProfilePanel({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }): JSX.Element {
  return (
    <section className={cn('rounded-lg border border-[var(--border-strong)] bg-card/40 p-3', className)}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        {description ? <p className="mt-1 text-[12px] leading-snug text-[var(--text-subtle)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ProfileSelect<T extends string>({ label, value, options, onValueChange, testId, disabled = false }: { label: string; value: T; options: readonly SelectOption<T>[]; onValueChange: (value: T) => void; testId?: string; disabled?: boolean }): JSX.Element {
  const generatedId = useId();
  const triggerId = testId ? `${testId}-trigger` : generatedId;

  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={triggerId} className="text-[12px] font-medium text-[var(--text-subtle)]">
        {label}
      </FieldLabel>
      <Select
        value={value}
        onValueChange={(next) => {
          if (typeof next === 'string') onValueChange(next);
        }}
      >
        <SelectTrigger id={triggerId} className="w-full" data-testid={testId} disabled={disabled}>
          <SelectValue>{(selected) => optionLabel(options, selected)}</SelectValue>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} onClick={() => onValueChange(option.value)} data-testid={testId ? `${testId}-option-${option.value}` : undefined}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function ProfileHelpTooltip({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger
        render={(props) => (
          <button type="button" {...props} aria-label={`${label} help`} className="inline-flex size-5 items-center justify-center rounded text-[var(--text-subtle)] hover:bg-muted hover:text-foreground">
            <Info className="size-3.5" aria-hidden />
          </button>
        )}
      />
      <TooltipContent className="max-w-[18rem] leading-snug">{children}</TooltipContent>
    </Tooltip>
  );
}

function ProfileSwitchRow({ id, label, description, checked, onCheckedChange }: { id: string; label: string; description?: string; checked: boolean; onCheckedChange: (checked: boolean) => void }): JSX.Element {
  return (
    <Field orientation="horizontal" className="min-h-10 items-center justify-between gap-3 rounded-md border border-border bg-background/25 px-3 py-2 text-[12px]">
      <FieldContent className="min-w-0">
        <FieldTitle id={id} className="flex items-center gap-1.5 text-[12px] font-medium">
          {label}
          {description ? <ProfileHelpTooltip label={label}>{description}</ProfileHelpTooltip> : null}
        </FieldTitle>
      </FieldContent>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-labelledby={id} />
    </Field>
  );
}

export function DownloadProfileEditor({ initialProfile = null, open, onOpenChange, onSave }: { initialProfile?: DownloadProfile | null; open: boolean; onOpenChange: (open: boolean) => void; onSave?: (profile: DownloadProfile) => void | Promise<void> }): JSX.Element {
  const [profileName, setProfileName] = useState(initialProfile?.name ?? 'Study Captions');
  const [profileIcon, setProfileIcon] = useState<DownloadProfileIcon>(initialProfile?.icon ?? 'captions');
  const [profileIconPickerOpen, setProfileIconPickerOpen] = useState(false);
  const [mediaMode, setMediaMode] = useState<ProfileMediaMode>(() => initialMediaMode(initialProfile));
  const [codec, setCodec] = useState<ProfileCodec>(() => initialCodec(initialProfile));
  const [resolution, setResolution] = useState<ProfileResolution>(() => initialResolution(initialProfile));
  const [audioFormat, setAudioFormat] = useState<ProfileAudioFormat>(() => initialAudioFormat(initialProfile));
  const [audioQuality, setAudioQuality] = useState<ProfileAudioQuality>(() => (initialProfile?.media.kind === 'audio-only' ? bitrateToQuality(initialProfile.media.audio.bitrateKbps) : '192'));
  const [subtitleEnabled, setSubtitleEnabled] = useState(initialProfile ? initialProfile.subtitles.enabled || initialProfile.media.kind === 'subtitles-only' : true);
  const [subtitleLanguages, setSubtitleLanguages] = useState<string[]>(initialProfile ? initialProfile.subtitles.languages : ['en', 'uk']);
  const [subtitleLanguageDraft, setSubtitleLanguageDraft] = useState('');
  const [subtitleSource, setSubtitleSource] = useState<ProfileSubtitleSource>(initialProfile?.subtitles.source ?? 'manual-first');
  const [subtitleDelivery, setSubtitleDelivery] = useState<ProfileSubtitleDelivery>(initialProfile?.subtitles.mode ?? 'sidecar');
  const [subtitleFormat, setSubtitleFormat] = useState<ProfileSubtitleFormat>(initialProfile?.subtitles.format ?? 'srt');
  const [destination, setDestination] = useState(initialProfile?.output.kind === 'fixed' ? initialProfile.output.dir : '');
  const [saveInsideSubfolder, setSaveInsideSubfolder] = useState(initialProfile?.subfolder.enabled ?? true);
  const [subfolderName, setSubfolderName] = useState(initialProfile?.subfolder.name ?? defaultProfileSubfolderName(initialProfile?.name ?? 'Study Captions'));
  const [embedMetadata, setEmbedMetadata] = useState(initialProfile?.embed.metadata ?? true);
  const [embedChapters, setEmbedChapters] = useState(initialProfile?.embed.chapters ?? true);
  const [saveDescription, setSaveDescription] = useState(initialProfile?.embed.description ?? true);
  const [saveThumbnail, setSaveThumbnail] = useState(initialProfile?.embed.thumbnailSidecar ?? true);
  const [sponsorBlockMode, setSponsorBlockMode] = useState<ProfileSponsorBlockMode>(initialProfile?.sponsorBlock.mode ?? 'off');
  const [playlistCap, setPlaylistCap] = useState<ProfilePlaylistCap>(() => playlistCapToControlValue(initialProfile?.playlistProbeCap));
  const showVideo = mediaMode === 'video-audio' || mediaMode === 'video-only';
  const showAudio = mediaMode === 'video-audio' || mediaMode === 'audio-only';
  const subtitlesOnly = mediaMode === 'subtitles-only';
  const effectiveSubtitleEnabled = subtitlesOnly || subtitleEnabled;
  const outputEnabledCount = [embedMetadata, embedChapters, saveDescription, saveThumbnail].filter(Boolean).length;
  const SelectedProfileIcon = PROFILE_ICON_OPTIONS.find((option) => option.value === profileIcon)?.icon ?? Captions;
  const subfolderInvalid = saveInsideSubfolder && subfolderName.trim() !== '' && !isValidSubfolder(subfolderName);
  const videoAudioFormat: Extract<ProfileAudioFormat, 'best' | 'm4a'> = audioFormat === 'm4a' ? 'm4a' : 'best';
  const audioQualityDisabled = audioFormat === 'best' || audioFormat === 'wav';

  function changeProfileName(nextName: string): void {
    const previousDefaultSubfolder = defaultProfileSubfolderName(profileName);
    const nextDefaultSubfolder = defaultProfileSubfolderName(nextName);
    setProfileName(nextName);
    setSubfolderName((current) => (current === previousDefaultSubfolder ? nextDefaultSubfolder : current));
  }

  function setProfileMediaMode(nextMode: ProfileMediaMode): void {
    setMediaMode(nextMode);
    if (nextMode === 'subtitles-only') setSubtitleEnabled(true);
    if (nextMode === 'audio-only') {
      setAudioFormat('best');
      setAudioQuality('best');
      return;
    }
    setAudioFormat(codec === 'mp4' ? 'm4a' : 'best');
    setAudioQuality('best');
  }

  function setProfileCodec(nextCodec: ProfileCodec): void {
    setCodec(nextCodec);
    if (mediaMode === 'video-audio') {
      setAudioFormat(nextCodec === 'mp4' ? 'm4a' : 'best');
    }
  }

  function addSubtitleLanguages(): void {
    const nextCodes = parseLanguageCodes(subtitleLanguageDraft);
    if (nextCodes.length === 0) return;
    setSubtitleLanguages((current) => [...new Set([...current, ...nextCodes])]);
    setSubtitleLanguageDraft('');
  }

  function removeSubtitleLanguage(code: string): void {
    setSubtitleLanguages((current) => current.filter((item) => item !== code));
  }

  async function saveProfile(): Promise<void> {
    const now = new Date().toISOString();
    const id = initialProfile?.id ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `profile-${Date.now()}`);
    const profile: DownloadProfile = {
      id,
      name: profileName.trim() || 'Download Profile',
      icon: profileIcon,
      media: mediaMode === 'audio-only' ? { kind: 'audio-only', audio: audioFormat === 'best' || audioFormat === 'wav' ? { format: audioFormat } : { format: audioFormat, bitrateKbps: audioQuality === 'best' ? DEFAULT_AUDIO_BITRATE : (Number(audioQuality) as 128 | 192 | 320) } } : mediaMode === 'subtitles-only' ? { kind: 'subtitles-only' } : mediaMode === 'video-audio' ? { kind: mediaMode, codec, tiers: [resolution], audio: { format: videoAudioFormat } } : { kind: mediaMode, codec, tiers: [resolution] },
      subtitles: {
        enabled: effectiveSubtitleEnabled,
        languages: effectiveSubtitleEnabled ? subtitleLanguages : [],
        source: subtitleSource,
        mode: subtitleDelivery,
        format: subtitleFormat
      },
      output: destination.trim() ? { kind: 'fixed', dir: destination.trim() } : { kind: 'default' },
      subfolder: { enabled: saveInsideSubfolder, name: saveInsideSubfolder ? subfolderName.trim() || defaultProfileSubfolderName(profileName) : '' },
      sponsorBlock: {
        mode: showVideo ? sponsorBlockMode : 'off',
        categories: showVideo && sponsorBlockMode !== 'off' ? [...DEFAULTS.sponsorBlockCategories] : []
      },
      embed: {
        chapters: showVideo && embedChapters,
        metadata: embedMetadata,
        thumbnail: false,
        description: saveDescription,
        thumbnailSidecar: saveThumbnail
      },
      playlistProbeCap: playlistCap === 'confirm' ? 'confirm' : Number(playlistCap),
      createdAt: initialProfile?.createdAt ?? now,
      updatedAt: now
    };
    await onSave?.(profile);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[58rem]" data-testid="profiles-editor-dialog">
        <DialogHeader>
          <DialogTitle>Download Profile</DialogTitle>
          <DialogDescription>One reusable setup for Quick Download, Bulk URLs, and playlists.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[min(78vh,46rem)]">
          <div className="grid gap-4 p-1 pr-3 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.85fr)]">
            <div className="flex flex-col gap-3">
              <ProfilePanel title="Profile identity" description="Name and icon shown in Quick Download, Bulk URLs, and profile lists.">
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="profile-name" className="text-[12px] font-medium text-[var(--text-subtle)]">
                    Profile name
                  </FieldLabel>
                  <InputGroup className="h-10" aria-label="Profile name and icon">
                    <Popover open={profileIconPickerOpen} onOpenChange={setProfileIconPickerOpen}>
                      <InputGroupAddon align="inline-start" className="pl-1.5">
                        <PopoverTrigger
                          render={
                            <InputGroupButton type="button" size="sm" className="h-8 w-14 justify-between px-2" aria-label="Choose profile icon" data-testid="profiles-editor-icon-trigger">
                              <SelectedProfileIcon data-icon="inline-start" aria-hidden />
                              <ChevronDown data-icon="inline-end" aria-hidden />
                            </InputGroupButton>
                          }
                        />
                      </InputGroupAddon>
                      <PopoverContent align="start" sideOffset={6} className="w-40" data-testid="profiles-editor-icon-menu">
                        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Profile icon">
                          {PROFILE_ICON_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const selected = profileIcon === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                title={option.label}
                                onClick={() => {
                                  setProfileIcon(option.value);
                                  setProfileIconPickerOpen(false);
                                }}
                                className={cn('grid h-10 place-items-center rounded-lg border bg-background/25 text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-foreground', selected ? 'border-[var(--brand)] bg-[var(--brand-dim)] text-[var(--brand)] shadow-[0_0_0_2px_var(--brand-dim)]' : 'border-border')}
                                data-testid={`profiles-editor-icon-${option.value}`}
                              >
                                <Icon aria-hidden />
                                <span className="sr-only">{option.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <InputGroupInput id="profile-name" value={profileName} onChange={(event) => changeProfileName(event.target.value)} data-testid="profiles-editor-name" />
                  </InputGroup>
                </Field>
              </ProfilePanel>

              <ProfilePanel title="Download type" description="Choose the primary way you want to download.">
                <ToggleGroup
                  variant="outline"
                  value={[mediaMode]}
                  onValueChange={(value) => {
                    if (value[0]) setProfileMediaMode(value[0] as ProfileMediaMode);
                  }}
                  spacing={2}
                  className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
                >
                  {MEDIA_MODES.map((option) => {
                    const Icon = option.icon;
                    return (
                      <ToggleGroupItem key={option.value} value={option.value} className={OUTPUT_MODE_CARD_CLASS} title={option.description}>
                        <Icon data-icon="inline-start" aria-hidden />
                        <span className="text-[11px] font-semibold leading-tight">{option.label}</span>
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
              </ProfilePanel>

              <div className="grid gap-3 sm:grid-cols-2">
                {showVideo ? (
                  <ProfilePanel title="Video">
                    <FieldGroup className="gap-3">
                      <ProfileSelect label="Compatibility" value={codec} options={VIDEO_COMPATIBILITY_OPTIONS} onValueChange={setProfileCodec} testId="profiles-editor-video-codec" />
                      <ProfileSelect label="Resolution" value={resolution} options={RESOLUTION_OPTIONS} onValueChange={setResolution} testId="profiles-editor-video-resolution" />
                    </FieldGroup>
                  </ProfilePanel>
                ) : null}

                {showAudio ? (
                  <ProfilePanel title="Audio">
                    <FieldGroup className="gap-3">
                      {mediaMode === 'audio-only' ? (
                        <>
                          <ProfileSelect label="Format" value={audioFormat} options={AUDIO_FORMAT_OPTIONS} onValueChange={setAudioFormat} testId="profiles-editor-audio-format" />
                          <ProfileSelect label="Quality" value={audioQuality} options={AUDIO_QUALITY_OPTIONS} onValueChange={setAudioQuality} testId="profiles-editor-audio-quality" disabled={audioQualityDisabled} />
                        </>
                      ) : (
                        <ProfileSelect label="Format" value={videoAudioFormat} options={VIDEO_AUDIO_FORMAT_OPTIONS} onValueChange={setAudioFormat} testId="profiles-editor-audio-format" />
                      )}
                    </FieldGroup>
                  </ProfilePanel>
                ) : null}
              </div>

              {subtitlesOnly ? <div className="rounded-md border border-[var(--brand)]/40 bg-[var(--brand-dim)] px-3 py-2 text-[12px] text-[var(--text-subtle)]">This profile queues subtitle files only. Video, audio, SponsorBlock, and media conversion are skipped.</div> : null}

              <ProfilePanel title="Subtitles">
                <FieldGroup className="gap-3">
                  <Field orientation="horizontal" className="items-start justify-between gap-3">
                    <FieldContent className="gap-1">
                      <FieldTitle id="profile-subtitle-downloads" className="text-[12px] font-medium text-[var(--text-subtle)]">
                        Subtitle downloads
                      </FieldTitle>
                      <FieldDescription className="text-[11px] leading-snug text-[var(--text-subtle)]">Profiles request language codes; availability is resolved for each URL.</FieldDescription>
                    </FieldContent>
                    <ToggleGroup
                      variant="outline"
                      aria-labelledby="profile-subtitle-downloads"
                      value={[effectiveSubtitleEnabled ? 'on' : 'off']}
                      onValueChange={(value) => {
                        const next = value[0];
                        if (next === 'on') setSubtitleEnabled(true);
                        if (next === 'off' && !subtitlesOnly) setSubtitleEnabled(false);
                      }}
                      className="grid w-36 shrink-0 grid-cols-2"
                    >
                      <ToggleGroupItem value="off" disabled={subtitlesOnly} className={SELECTABLE_TOGGLE_CLASS}>
                        Off
                      </ToggleGroupItem>
                      <ToggleGroupItem value="on" className={SELECTABLE_TOGGLE_CLASS}>
                        On
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Field>

                  {!effectiveSubtitleEnabled ? (
                    <div className="rounded-md border border-border bg-background/25 px-3 py-2 text-[12px] leading-snug text-[var(--text-subtle)]">No subtitle files or embedded subtitle tracks will be requested for this profile.</div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)]">
                      <Field className="gap-1.5">
                        <FieldLabel htmlFor="profile-subtitle-language-draft" className="text-[12px] font-medium text-[var(--text-subtle)]">
                          Languages
                        </FieldLabel>
                        <div className="flex min-h-8 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background/30 px-2 py-1">
                          {subtitleLanguages.length > 0 ? (
                            subtitleLanguages.map((code) => (
                              <button key={code} type="button" onClick={() => removeSubtitleLanguage(code)} className="inline-flex h-6 items-center gap-1 rounded-full bg-secondary px-2 text-[11px] font-semibold text-secondary-foreground hover:bg-muted" aria-label={`Remove ${code}`}>
                                <span>{code}</span>
                                <X className="size-3" aria-hidden />
                              </button>
                            ))
                          ) : (
                            <span className="px-1 text-[11px] italic text-[var(--text-subtle)]">No languages selected</span>
                          )}
                        </div>
                        <InputGroup aria-label="Subtitle language codes">
                          <InputGroupInput
                            id="profile-subtitle-language-draft"
                            value={subtitleLanguageDraft}
                            onChange={(event) => setSubtitleLanguageDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter') return;
                              event.preventDefault();
                              addSubtitleLanguages();
                            }}
                            placeholder="en, uk, pt-br"
                            className="text-[12px]"
                            aria-label="Subtitle language codes"
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton type="button" className="text-[11px]" onClick={addSubtitleLanguages} disabled={subtitleLanguageDraft.trim().length === 0}>
                              <Plus data-icon="inline-start" />
                              Add
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>

                      <FieldGroup className="gap-3">
                        <ProfileSelect label="Source" value={subtitleSource} options={SUBTITLE_SOURCE_OPTIONS} onValueChange={setSubtitleSource} testId="profiles-editor-subtitle-source" />

                        <Field className="gap-1.5">
                          <FieldTitle id="profile-subtitle-delivery" className="text-[12px] font-medium text-[var(--text-subtle)]">
                            Delivery
                          </FieldTitle>
                          <ToggleGroup
                            variant="outline"
                            aria-labelledby="profile-subtitle-delivery"
                            value={[subtitleDelivery]}
                            onValueChange={(value) => {
                              if (value[0]) setSubtitleDelivery(value[0] as ProfileSubtitleDelivery);
                            }}
                            className="grid w-full grid-cols-3"
                          >
                            {SUBTITLE_DELIVERY_OPTIONS.map((option) => (
                              <ToggleGroupItem key={option.value} value={option.value} className={SELECTABLE_TOGGLE_CLASS}>
                                {option.label}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                          {subtitleDelivery === 'embed' ? <FieldDescription className="text-[11px] leading-snug text-[var(--text-subtle)]">Embed mode saves output as .mkv so subtitle tracks embed reliably.</FieldDescription> : null}
                        </Field>

                        {subtitleDelivery !== 'embed' ? (
                          <Field className="gap-1.5">
                            <FieldTitle id="profile-subtitle-format" className="text-[12px] font-medium text-[var(--text-subtle)]">
                              Format
                            </FieldTitle>
                            <ToggleGroup
                              variant="outline"
                              aria-labelledby="profile-subtitle-format"
                              value={[subtitleFormat]}
                              onValueChange={(value) => {
                                if (value[0]) setSubtitleFormat(value[0] as ProfileSubtitleFormat);
                              }}
                              className="grid w-full grid-cols-3"
                            >
                              {SUBTITLE_FORMAT_OPTIONS.map((option) => (
                                <ToggleGroupItem key={option.value} value={option.value} className={SELECTABLE_TOGGLE_CLASS}>
                                  {option.label}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>
                            {subtitleSource !== 'manual-only' && subtitleFormat === 'ass' ? <FieldDescription className="text-[11px] leading-snug text-[var(--text-subtle)]">Auto-captions will be saved as SRT instead of ASS.</FieldDescription> : null}
                          </Field>
                        ) : null}
                      </FieldGroup>
                    </div>
                  )}
                </FieldGroup>
              </ProfilePanel>
            </div>

            <ProfilePanel title="Advanced options" className="lg:self-start">
              <FieldGroup className="gap-3">
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="profile-destination" className="text-[12px] font-medium text-[var(--text-subtle)]">
                    Destination
                  </FieldLabel>
                  <InputGroup aria-label="Destination folder">
                    <InputGroupInput id="profile-destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Default downloads folder" className="font-mono text-[12px]" />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton type="button" size="icon-xs" aria-label="Choose destination folder">
                        <Folder aria-hidden />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <Field orientation="horizontal" className="items-center gap-2 text-[12px] text-[var(--text-subtle)]">
                  <Checkbox id="profile-subfolder-enabled" checked={saveInsideSubfolder} onCheckedChange={(checked) => setSaveInsideSubfolder(checked === true)} />
                  <FieldLabel htmlFor="profile-subfolder-enabled" className="text-[12px] text-[var(--text-subtle)]">
                    Save inside subfolder
                  </FieldLabel>
                </Field>
                <Field className="gap-1.5 pl-7">
                  <FieldLabel htmlFor="profile-subfolder-name" className="text-[12px] font-medium text-[var(--text-subtle)]">
                    Subfolder name
                  </FieldLabel>
                  <InputGroup aria-label="Subfolder name">
                    <InputGroupInput id="profile-subfolder-name" value={subfolderName} onChange={(event) => setSubfolderName(event.target.value)} disabled={!saveInsideSubfolder} placeholder={defaultProfileSubfolderName(profileName)} maxLength={64} aria-invalid={subfolderInvalid} data-testid="profiles-editor-subfolder-name" />
                  </InputGroup>
                  {subfolderInvalid ? <FieldDescription className="text-[12px] text-destructive">Use a valid folder name without / \ : * ? &quot; &lt; &gt; |.</FieldDescription> : null}
                </Field>

                <section className="rounded-lg border border-border bg-background/25 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold">Output options</h4>
                    <Badge variant="outline">{outputEnabledCount} enabled</Badge>
                  </div>
                  <div className="grid gap-2">
                    <ProfileSwitchRow id="profile-output-metadata" label="Embed metadata" description={OUTPUT_OPTION_DESCRIPTIONS.metadata} checked={embedMetadata} onCheckedChange={setEmbedMetadata} />
                    <ProfileSwitchRow id="profile-output-chapters" label="Embed chapters" description={OUTPUT_OPTION_DESCRIPTIONS.chapters} checked={embedChapters} onCheckedChange={setEmbedChapters} />
                    <ProfileSwitchRow id="profile-output-description" label="Save description" description={OUTPUT_OPTION_DESCRIPTIONS.description} checked={saveDescription} onCheckedChange={setSaveDescription} />
                    <ProfileSwitchRow id="profile-output-thumbnail" label="Save thumbnail" description={OUTPUT_OPTION_DESCRIPTIONS.thumbnail} checked={saveThumbnail} onCheckedChange={setSaveThumbnail} />
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-background/25 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold">SponsorBlock</h4>
                    <Badge variant="outline">{showVideo ? optionLabel(SPONSOR_BLOCK_OPTIONS, sponsorBlockMode) : 'Skipped'}</Badge>
                  </div>
                  {showVideo ? (
                    <ToggleGroup
                      variant="outline"
                      value={[sponsorBlockMode]}
                      onValueChange={(value) => {
                        if (value[0]) setSponsorBlockMode(value[0] as ProfileSponsorBlockMode);
                      }}
                      className="grid w-full grid-cols-3"
                    >
                      {SPONSOR_BLOCK_OPTIONS.map((option) => (
                        <ToggleGroupItem key={option.value} value={option.value} className={SELECTABLE_TOGGLE_CLASS} title={SPONSOR_BLOCK_HINTS[option.value]}>
                          {option.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  ) : (
                    <p className="text-[12px] leading-snug text-[var(--text-subtle)]">Skipped for this output type.</p>
                  )}
                </section>

                <ProfileSelect label="Playlist probe cap" value={playlistCap} options={PLAYLIST_CAP_OPTIONS} onValueChange={setPlaylistCap} testId="profiles-editor-playlist-cap" />
              </FieldGroup>
            </ProfilePanel>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void saveProfile()} disabled={subfolderInvalid} className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none">
            Save profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
