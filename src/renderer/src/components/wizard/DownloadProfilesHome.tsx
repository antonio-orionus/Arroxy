import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type JSX, type KeyboardEvent } from 'react';
import { Archive, BookOpen, Captions, Check, ChevronDown, ChevronRight, Clapperboard, Download, FileAudio, Headphones, Link2, ListPlus, Music, Plus, Scissors, Settings, Users, Wand2, X, Zap, type LucideIcon } from 'lucide-react';
import { allDownloadProfiles, downloadProfileLabel, resolveActiveDownloadProfile } from '@shared/downloadProfiles.js';
import { cleanUrl } from '@shared/cleanUrl.js';
import type { DownloadProfile, DownloadProfileIcon, DownloadProfilesPrefs } from '@shared/types.js';
import { classifyBulkUrlKind, parseBulkUrls } from '@shared/bulkUrls.js';
import { bulkLogger } from '@renderer/lib/bulkLogger.js';
import { notify } from '@renderer/lib/notify.js';
import { cn } from '@renderer/lib/utils.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '../ui/popover.js';
import { Separator } from '../ui/separator.js';
import { BulkUrlDialog } from './BulkUrlDialog.js';
import { DownloadProfileEditor } from './DownloadProfileEditor.js';
import { DownloadProfilesSettingsTab } from './DownloadProfilesSettingsTab.js';
import { IncompleteCookiesConfigDialog } from './IncompleteCookiesConfigDialog.js';

type ProfilesTab = 'download' | 'profiles' | 'settings';

const BUILTIN_PROFILE_IDS = new Set(['best-quality', 'balanced', 'small-file', 'audio-only']);

const ICONS: Record<DownloadProfileIcon, LucideIcon> = {
  archive: Archive,
  audio: FileAudio,
  captions: Captions,
  classes: BookOpen,
  clip: Scissors,
  download: Download,
  music: Music,
  podcast: Headphones,
  video: Clapperboard
};

function tabFromHash(hash = window.location.hash): ProfilesTab {
  const value = hash.replace(/^#/, '').toLowerCase();
  if (value === 'profile' || value === 'profiles') return 'profiles';
  if (value === 'setting' || value === 'settings') return 'settings';
  return 'download';
}

function tabHash(tab: ProfilesTab): string {
  if (tab === 'profiles') return '#profiles';
  if (tab === 'settings') return '#settings';
  return '#download';
}

function profileDetail(profile: DownloadProfile): string {
  const subs = profile.subtitles.enabled || profile.media.kind === 'subtitles-only' ? `${profile.subtitles.languages.join(', ') || 'selected'} subtitles` : 'no subtitles';
  const output = profile.output.kind === 'fixed' ? profile.output.dir : 'default folder';
  const artifacts = [profile.embed.metadata ? 'metadata' : null, profile.embed.thumbnailSidecar ? 'thumbnail' : null, profile.embed.description ? 'description' : null].filter(Boolean).join(' · ');
  return `${subs} · ${output}${artifacts ? ` · ${artifacts}` : ''}`;
}

function detectUrlType(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const kind = classifyBulkUrlKind(cleanUrl(trimmed));
    if (kind === 'single') return 'Single URL';
    if (kind === 'playlist') return 'Playlist URL';
    if (kind === 'channel') return 'Channel URL';
    if (kind === 'search') return 'Search URL';
    return 'URL';
  } catch {
    return 'Unknown URL';
  }
}

function isCustomProfile(profile: DownloadProfile | null, prefs: DownloadProfilesPrefs | undefined): boolean {
  if (!profile) return false;
  return prefs?.custom.some((item) => item.id === profile.id) ?? false;
}

export function DownloadProfilesHome(): JSX.Element {
  const { cookiesConfigDialogIssue, dismissCookiesConfigDialog, openCookiesSettings, quickDownload, quickDownloadError, quickDownloadStatus, removeCustomDownloadProfile, saveDownloadProfile, setActiveDownloadProfile, setWizardUrl, settings, submitUrl, wizardUrl } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const bulkOpenRef = useRef(false);
  const [activeTab, setActiveTab] = useState<ProfilesTab>(() => tabFromHash());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSessionId, setEditorSessionId] = useState(0);
  const [editingProfile, setEditingProfile] = useState<DownloadProfile | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profilesPrefs = settings?.profiles;
  const profiles = useMemo(() => allDownloadProfiles(profilesPrefs), [profilesPrefs]);
  const { profile: activeProfile } = resolveActiveDownloadProfile(profilesPrefs);
  const hasInput = wizardUrl.trim().length > 0;
  const inputType = detectUrlType(wizardUrl);
  const quickPreparing = quickDownloadStatus === 'preparing';
  const quickErrorText = quickDownloadError === 'wizard.url.quickProbeFailed' ? 'Could not read the URL.' : quickDownloadError === 'wizard.url.quickPrepareFailed' ? 'Could not prepare that download.' : (quickDownloadError ?? '');

  useEffect(() => {
    const sync = (): void => setActiveTab(tabFromHash());
    window.addEventListener('hashchange', sync);
    sync();
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    bulkOpenRef.current = bulkOpen;
  }, [bulkOpen]);

  useEffect(() => {
    return window.appApi.events.onClipboardUrl((payload) => {
      if (bulkOpenRef.current) {
        bulkLogger.info('Clipboard URL ignored while bulk dialog is open');
        return;
      }

      const state = useAppStore.getState();
      if (state.wizardUrl.trim()) return;
      if (state.formatsLoading) return;
      if (state.quickDownloadStatus === 'preparing') return;

      const parsed = parseBulkUrls(payload);
      if (parsed.accepted.length >= 1) {
        const firstUrl = parsed.accepted[0]?.url ?? cleanUrl(payload);
        setWizardUrl(firstUrl);
        bulkLogger.info('Bulk URLs detected from clipboard', {
          accepted: parsed.accepted.length,
          rejected: parsed.rejected.length,
          ignored: parsed.ignoredCount
        });
        notify.clipboardAutofilled(parsed.accepted.length > 1 ? `${parsed.accepted.length} links found; first link added` : 'Link added from clipboard');
        return;
      }

      const cleaned = cleanUrl(payload);
      if (!cleaned.trim()) return;
      setWizardUrl(cleaned);
      notify.clipboardAutofilled('Link added from clipboard');
    });
  }, [setWizardUrl]);

  function selectTab(tab: ProfilesTab): void {
    setActiveTab(tab);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${tabHash(tab)}`);
  }

  function openEditor(profile: DownloadProfile | null): void {
    setEditingProfile(isCustomProfile(profile, profilesPrefs) ? profile : null);
    setEditorSessionId((value) => value + 1);
    setEditorOpen(true);
  }

  function handleClearUrl(): void {
    setWizardUrl('');
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter' && wizardUrl.trim() && !quickPreparing) {
      void submitUrl();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>): void {
    const pasted = event.clipboardData.getData('text');
    const cleaned = cleanUrl(pasted);
    if (cleaned === pasted) return;
    event.preventDefault();
    const input = event.currentTarget;
    const start = input.selectionStart ?? wizardUrl.length;
    const end = input.selectionEnd ?? wizardUrl.length;
    setWizardUrl(wizardUrl.slice(0, start) + cleaned + wizardUrl.slice(end));
  }

  return (
    <div className="wizard-step mx-auto flex w-full max-w-6xl flex-col gap-4 pb-5" data-testid="download-profiles-home">
      <nav className="flex flex-wrap items-center gap-5 border-b border-border/80" aria-label="Download profile navigation" data-testid="profiles-tabs">
        <TabButton active={activeTab === 'download'} icon={Download} label="Download" onClick={() => selectTab('download')} />
        <TabButton active={activeTab === 'profiles'} icon={Users} label="Profiles" onClick={() => selectTab('profiles')} />
        <TabButton active={activeTab === 'settings'} icon={Settings} label="Settings" onClick={() => selectTab('settings')} />
      </nav>

      {activeTab === 'download' ? (
        <section className="rounded-lg border border-[var(--border-strong)] bg-card/40 p-4" data-testid="profiles-download-panel">
          <div className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-[var(--brand)]/40 bg-[var(--brand-dim)] text-[var(--brand)]">
              <Download aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold leading-tight">Download input</h2>
              <p className="mt-1 text-[12px] text-[var(--text-subtle)]">Enter a URL to start your download.</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-background/35 px-3 py-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <Link2 className="shrink-0 text-[var(--text-subtle)]" aria-hidden />
            <Input ref={inputRef} type="url" value={wizardUrl} onChange={(event) => setWizardUrl(event.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} placeholder="Paste a URL..." spellCheck={false} data-testid="profiles-main-input" className="h-8 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent" />
            {hasInput ? (
              <button type="button" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--text-subtle)] hover:bg-muted hover:text-foreground" aria-label="Clear URL" onClick={handleClearUrl} data-testid="url-clear">
                <X data-icon="inline-start" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-subtle)]">
            <Badge variant="outline" className={cn(hasInput ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-border text-[var(--text-subtle)]')}>
              {hasInput ? 'URL entered' : 'Waiting for URL'}
            </Badge>
            {inputType ? (
              <Badge variant="outline" className="border-[var(--brand)]/40 bg-[var(--brand-dim)] text-[var(--brand)]">
                {inputType}
              </Badge>
            ) : null}
          </div>

          <Separator className="my-5" />

          <QuickProfileCard activeProfile={activeProfile} disabled={!hasInput || quickPreparing} menuOpen={profileMenuOpen} onDownload={() => void quickDownload()} onEditProfile={() => openEditor(activeProfile)} onManageProfiles={() => selectTab('profiles')} onMenuOpenChange={setProfileMenuOpen} onNewProfile={() => openEditor(null)} onPickProfile={(profile) => void setActiveDownloadProfile({ kind: isCustomProfile(profile, profilesPrefs) ? 'custom' : 'builtin', id: profile.id })} profiles={profiles} />

          {quickDownloadStatus === 'error' ? (
            <p className="mt-2 text-[11px] text-amber-500" data-testid="quick-download-feedback">
              Quick Download failed: {quickErrorText}
            </p>
          ) : null}

          <div className="mt-3 grid gap-2">
            <ActionRow disabled={!hasInput || quickPreparing} icon={Wand2} title="Interactive Download" description="Review and customize options before downloading." onClick={() => void submitUrl()} testId="profiles-interactive-download" />
            <ActionRow icon={ListPlus} title="Bulk URLs" description="Choose Quick or Interactive for batch downloads." onClick={() => setBulkOpen(true)} testId="profiles-bulk-urls" />
          </div>
        </section>
      ) : null}

      {activeTab === 'profiles' ? <ProfilesTab activeProfile={activeProfile} onEdit={openEditor} onPick={(profile) => void setActiveDownloadProfile({ kind: isCustomProfile(profile, profilesPrefs) ? 'custom' : 'builtin', id: profile.id })} onRemove={(profile) => void removeCustomDownloadProfile(profile.id)} profiles={profiles} /> : null}
      {activeTab === 'settings' ? <DownloadProfilesSettingsTab /> : null}

      {bulkOpen ? <BulkUrlDialog open={bulkOpen} onOpenChange={setBulkOpen} initialRaw="" /> : null}
      <DownloadProfileEditor key={editorSessionId} initialProfile={editingProfile} open={editorOpen} onOpenChange={setEditorOpen} onSave={(profile) => saveDownloadProfile(profile)} />
      <IncompleteCookiesConfigDialog issue={cookiesConfigDialogIssue} onDismiss={dismissCookiesConfigDialog} onOpenSettings={openCookiesSettings} />
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void }): JSX.Element {
  return (
    <button type="button" aria-current={active ? 'page' : undefined} className={cn('inline-flex h-11 items-center gap-2 border-b-2 px-1 text-sm transition-colors', active ? 'border-[var(--brand)] font-semibold text-foreground' : 'border-transparent font-medium text-[var(--text-subtle)] hover:text-foreground')} onClick={onClick}>
      <Icon data-icon="inline-start" aria-hidden />
      {label}
    </button>
  );
}

function QuickProfileCard({ activeProfile, disabled, menuOpen, onDownload, onEditProfile, onManageProfiles, onMenuOpenChange, onNewProfile, onPickProfile, profiles }: { activeProfile: DownloadProfile; disabled: boolean; menuOpen: boolean; onDownload: () => void; onEditProfile: () => void; onManageProfiles: () => void; onMenuOpenChange: (open: boolean) => void; onNewProfile: () => void; onPickProfile: (profile: DownloadProfile) => void; profiles: DownloadProfile[] }): JSX.Element {
  const ActiveIcon = ICONS[activeProfile.icon];
  return (
    <div className="grid w-full grid-cols-[minmax(0,1fr)_3.5rem] overflow-hidden rounded-lg border border-[var(--brand)] bg-[var(--brand-dim)] shadow-[0_4px_14px_var(--brand-glow)] md:grid-cols-[minmax(12rem,0.8fr)_minmax(18rem,1fr)_3.5rem]" data-testid="profiles-quick-preview">
      <button type="button" disabled={disabled} onClick={onDownload} className="flex min-h-20 min-w-0 items-center gap-4 px-5 py-4 text-left text-primary-foreground transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:min-h-[6.5rem]" data-testid="profiles-quick-download">
        <Zap className="shrink-0 text-[var(--brand)]" aria-hidden />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-lg font-semibold">Quick Download</span>
          <span className="mt-1 text-[12px] font-medium text-white/70">Start download using the selected profile.</span>
        </span>
      </button>
      <div className="order-3 col-span-2 flex min-w-0 items-center gap-3 border-t border-white/10 bg-background/20 px-4 py-3 md:order-none md:col-auto md:border-s md:border-t-0">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--brand)]/35 bg-[var(--brand-dim)] text-[var(--brand)]">
          <ActiveIcon aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{activeProfile.name}</p>
          <p className="mt-1 truncate text-[12px] text-white/65">
            {downloadProfileLabel(activeProfile)} · {profileDetail(activeProfile)}
          </p>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={onEditProfile} aria-label={`Edit ${activeProfile.name}`} className="shrink-0 border-white/15 bg-white/5 hover:bg-white/10">
          <Wand2 />
        </Button>
      </div>
      <ProfileMenu activeProfile={activeProfile} menuOpen={menuOpen} onManageProfiles={onManageProfiles} onMenuOpenChange={onMenuOpenChange} onNewProfile={onNewProfile} onPickProfile={onPickProfile} profiles={profiles} />
    </div>
  );
}

function ProfileMenu({ activeProfile, menuOpen, onManageProfiles, onMenuOpenChange, onNewProfile, onPickProfile, profiles }: { activeProfile: DownloadProfile; menuOpen: boolean; onManageProfiles: () => void; onMenuOpenChange: (open: boolean) => void; onNewProfile: () => void; onPickProfile: (profile: DownloadProfile) => void; profiles: DownloadProfile[] }): JSX.Element {
  return (
    <Popover open={menuOpen} onOpenChange={onMenuOpenChange}>
      <PopoverTrigger
        render={
          <Button type="button" size="icon-lg" className="order-2 h-full min-h-20 w-full rounded-s-none border-s border-white/20 md:order-none md:min-h-[6.5rem]" aria-label="Choose download profile" data-testid="profiles-profile-menu-trigger">
            <ChevronDown />
          </Button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-[min(24rem,calc(100vw-2rem))]" data-testid="profiles-profile-menu">
        <PopoverHeader>
          <PopoverTitle>Download Profile</PopoverTitle>
          <PopoverDescription>Active profile for Quick Download, Bulk URLs, and playlists.</PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-col gap-1">
          {profiles.map((profile) => {
            const Icon = ICONS[profile.icon];
            const active = activeProfile.id === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  onPickProfile(profile);
                  onMenuOpenChange(false);
                }}
                className={cn('flex min-h-14 items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors', active ? 'border-[var(--brand)] bg-[var(--brand-dim)]' : 'border-border bg-muted/20 hover:border-[var(--border-strong)]')}
              >
                <Icon className="mt-0.5 shrink-0 text-[var(--brand)]" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="truncate text-[13px] font-semibold text-foreground">{profile.name}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-[var(--text-subtle)]">{downloadProfileLabel(profile)}</span>
                </span>
                {active ? <Check className="shrink-0 text-[var(--brand)]" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onNewProfile}>
            <Plus data-icon="inline-start" />
            New
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onManageProfiles}>
            <Users data-icon="inline-start" />
            Manage
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ActionRow({ description, disabled = false, icon: Icon, onClick, testId, title }: { description: string; disabled?: boolean; icon: LucideIcon; onClick: () => void; testId: string; title: string }): JSX.Element {
  return (
    <Button type="button" variant="outline" disabled={disabled} onClick={onClick} data-testid={testId} className="h-auto min-h-16 justify-start gap-3 whitespace-normal px-4 py-3 text-left">
      <Icon data-icon="inline-start" />
      <span className="flex min-w-0 flex-1 flex-col items-start">
        <span className="font-semibold">{title}</span>
        <span className="text-[12px] font-normal text-[var(--text-subtle)]">{description}</span>
      </span>
      <ChevronRight className="ms-auto text-[var(--text-subtle)]" aria-hidden />
    </Button>
  );
}

function ProfilesTab({ activeProfile, onEdit, onPick, onRemove, profiles }: { activeProfile: DownloadProfile; onEdit: (profile: DownloadProfile | null) => void; onPick: (profile: DownloadProfile) => void; onRemove: (profile: DownloadProfile) => void; profiles: DownloadProfile[] }): JSX.Element {
  return (
    <section className="rounded-lg border border-[var(--border-strong)] bg-card/40 p-4" data-testid="profiles-manage-tab">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold leading-tight">Download Profiles</h2>
          <p className="mt-1 text-[12px] text-[var(--text-subtle)]">Create, select, edit, or remove reusable download setups.</p>
        </div>
        <Button type="button" onClick={() => onEdit(null)} className="shadow-[0_4px_14px_var(--brand-glow)]">
          <Plus data-icon="inline-start" />
          New profile
        </Button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {profiles.map((profile) => {
          const Icon = ICONS[profile.icon];
          const active = activeProfile.id === profile.id;
          const custom = !BUILTIN_PROFILE_IDS.has(profile.id);
          return (
            <article key={profile.id} className={cn('rounded-lg border bg-background/25 p-3', active ? 'border-[var(--brand)] bg-[var(--brand-dim)]/35' : 'border-border')}>
              <button type="button" className="flex w-full items-start gap-3 text-left" onClick={() => onPick(profile)}>
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--brand)]/35 bg-[var(--brand-dim)] text-[var(--brand)]">
                  <Icon aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{profile.name}</span>
                    <Badge variant={custom ? 'outline' : 'secondary'}>{custom ? 'custom' : 'builtin'}</Badge>
                    {active ? <Check className="ml-auto shrink-0 text-[var(--brand)]" aria-hidden /> : null}
                  </span>
                  <span className="mt-1 block text-[12px] leading-snug text-[var(--text-subtle)]">{downloadProfileLabel(profile)}</span>
                  <span className="block text-[12px] leading-snug text-[var(--text-subtle)]">{profileDetail(profile)}</span>
                </span>
              </button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" disabled={!custom} onClick={() => onEdit(profile)}>
                  <Wand2 data-icon="inline-start" />
                  Edit
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={!custom} onClick={() => onRemove(profile)}>
                  <X data-icon="inline-start" />
                  Remove
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
