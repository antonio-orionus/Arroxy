import { type JSX, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type PlaylistAudioFormat, type PlaylistVideoTier, type PlaylistSelection, AUDIO_BITRATES, DEFAULT_PLAYLIST_SELECTION, PLAYLIST_VIDEO_TIERS } from '@shared/schemas.js';
import { useAppStore } from '../../store/useAppStore.js';
import { Button } from '../ui/button.js';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '../ui/item.js';
import { ScrollArea } from '../ui/scroll-area.js';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group.js';
import { WizardStepFooterActions } from './WizardStepFooterActions.js';
import { cn } from '@renderer/lib/utils.js';

const VIDEO_TIERS = PLAYLIST_VIDEO_TIERS;
// YouTube only serves H.264 ≤1080p — block higher tiers for MP4 codec
const MP4_BLOCKED_TIERS = new Set<PlaylistVideoTier>(['best', '2160', '1440']);
const AUDIO_FORMATS: PlaylistAudioFormat[] = ['best', 'mp3', 'm4a', 'opus'];
const LOSSY_AUDIO = new Set<PlaylistAudioFormat>(['mp3', 'm4a', 'opus']);

const SECTION_LABEL = 'text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)] mb-1.5';
const KIND_TAB_CLASS = 'flex-1 aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] data-[state=on]:border-[var(--brand)] data-[state=on]:bg-[var(--brand-dim)] data-[state=on]:text-[var(--brand)]';

export function StepPlaylistPresets(): JSX.Element {
  const { t } = useTranslation();
  const { playlistSelection, setPlaylistSelection, advance, back, skipToConfirm, selectedPlaylistItemIds } = useAppStore();

  const sel: PlaylistSelection = playlistSelection ?? DEFAULT_PLAYLIST_SELECTION;

  useEffect(() => {
    if (playlistSelection === null) setPlaylistSelection(DEFAULT_PLAYLIST_SELECTION);
  }, [playlistSelection, setPlaylistSelection]);

  function setKind(kind: 'video' | 'audio'): void {
    if (kind === 'video') {
      if (sel.kind === 'video') return;
      setPlaylistSelection({ kind: 'video', tier: 'best', codec: 'best' });
    } else {
      if (sel.kind === 'audio') return;
      setPlaylistSelection({ kind: 'audio', format: 'best' });
    }
  }

  function setVideoCodec(codec: 'best' | 'mp4'): void {
    if (sel.kind !== 'video') return;
    if (codec === 'mp4') {
      const tier = MP4_BLOCKED_TIERS.has(sel.tier) ? ('1080' as const) : sel.tier;
      setPlaylistSelection({ kind: 'video', tier, codec: 'mp4' });
    } else {
      setPlaylistSelection({ kind: 'video', tier: sel.tier, codec: 'best' });
    }
  }

  function setTier(tier: PlaylistVideoTier): void {
    if (sel.kind !== 'video') return;
    const blocked = sel.codec === 'mp4' && MP4_BLOCKED_TIERS.has(tier);
    if (blocked) return;
    setPlaylistSelection({ kind: 'video', tier, codec: sel.codec });
  }

  function setAudioFormat(format: PlaylistAudioFormat): void {
    if (sel.kind !== 'audio') return;
    if (format === 'best') {
      setPlaylistSelection({ kind: 'audio', format: 'best' });
    } else {
      const bitrate: (typeof AUDIO_BITRATES)[number] = sel.format !== 'best' ? (sel.bitrateKbps ?? 192) : 192;
      setPlaylistSelection({ kind: 'audio', format, bitrateKbps: bitrate });
    }
  }

  function setBitrate(kbps: (typeof AUDIO_BITRATES)[number]): void {
    if (sel.kind !== 'audio' || sel.format === 'best') return;
    setPlaylistSelection({ kind: 'audio', format: sel.format, bitrateKbps: kbps });
  }

  const currentKind = sel.kind;
  const currentCodec = sel.kind === 'video' ? sel.codec : 'best';
  const currentTier = sel.kind === 'video' ? sel.tier : 'best';
  const currentAudioFormat = sel.kind === 'audio' ? sel.format : 'best';
  const currentBitrate = sel.kind === 'audio' && sel.format !== 'best' ? (sel.bitrateKbps ?? 192) : 192;
  const showBitrate = sel.kind === 'audio' && LOSSY_AUDIO.has(sel.format);
  const showMp4Cap = sel.kind === 'video' && sel.codec === 'mp4';

  return (
    <div className="flex h-full flex-col gap-3 px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">{t('wizard.playlistPresets.heading')}</h2>
        <span className="shrink-0 text-xs text-muted-foreground">{t('wizard.playlistPresets.itemCount_other', { count: selectedPlaylistItemIds.length })}</span>
      </div>

      <ScrollArea className="h-[calc(100vh-272px)] min-h-[280px]">
        <div className="flex flex-col gap-4 p-1">
          {/* Type toggle */}
          <div>
            <p className={SECTION_LABEL}>{t('wizard.playlistPresets.subhead')}</p>
            <ToggleGroup
              variant="outline"
              value={[currentKind]}
              onValueChange={(arr) => {
                if (arr[0]) setKind(arr[0] as 'video' | 'audio');
              }}
              className="w-full"
            >
              <ToggleGroupItem value="video" className={KIND_TAB_CLASS}>
                {t('playlistPresets.type.video')}
              </ToggleGroupItem>
              <ToggleGroupItem value="audio" className={KIND_TAB_CLASS}>
                {t('playlistPresets.type.audio')}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {currentKind === 'video' && (
            <>
              {/* Codec / format toggle */}
              <div>
                <p className={SECTION_LABEL}>{t('playlistPresets.videoFormat.best')}</p>
                <ItemGroup className="grid grid-cols-2 gap-2">
                  {(['best', 'mp4'] as const).map((codec) => {
                    const selected = currentCodec === codec;
                    return (
                      <Item
                        key={codec}
                        variant="outline"
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        onClick={() => setVideoCodec(codec)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setVideoCodec(codec);
                          }
                        }}
                        className={cn('cursor-pointer hover:bg-muted/40', selected && 'border-primary bg-primary/5 shadow-[0_0_0_2px_var(--brand-dim)]')}
                      >
                        <ItemContent>
                          <ItemTitle>{t(`playlistPresets.videoFormat.${codec}`)}</ItemTitle>
                          <ItemDescription>{t(`playlistPresets.videoFormatDesc.${codec}`)}</ItemDescription>
                        </ItemContent>
                      </Item>
                    );
                  })}
                </ItemGroup>
              </div>

              {/* Quality / tier grid */}
              <div>
                <p className={SECTION_LABEL}>{t('playlistPresets.tier.best')}</p>
                <ItemGroup className="grid grid-cols-2 gap-2 md:grid-cols-3 md:grid-rows-auto">
                  {VIDEO_TIERS.map((tier) => {
                    const blocked = currentCodec === 'mp4' && MP4_BLOCKED_TIERS.has(tier);
                    const selected = currentTier === tier;
                    return (
                      <Item
                        key={tier}
                        variant="outline"
                        role="button"
                        tabIndex={blocked ? -1 : 0}
                        aria-pressed={selected}
                        aria-disabled={blocked}
                        onClick={() => setTier(tier)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setTier(tier);
                          }
                        }}
                        className={cn('cursor-pointer hover:bg-muted/40', selected && 'border-primary bg-primary/5 shadow-[0_0_0_2px_var(--brand-dim)]', blocked && 'cursor-not-allowed opacity-40')}
                      >
                        <ItemContent>
                          <ItemTitle>{t(`playlistPresets.tier.${tier}`)}</ItemTitle>
                          <ItemDescription>{t(`playlistPresets.tierDesc.${tier}`)}</ItemDescription>
                        </ItemContent>
                      </Item>
                    );
                  })}
                </ItemGroup>
                {showMp4Cap && <p className="mt-2 text-[11px] text-muted-foreground">{t('playlistPresets.mp4Cap')}</p>}
              </div>
            </>
          )}

          {currentKind === 'audio' && (
            <>
              {/* Audio format cards */}
              <div>
                <p className={SECTION_LABEL}>{t('playlistPresets.type.audio')}</p>
                <ItemGroup className="grid grid-cols-2 gap-2">
                  {AUDIO_FORMATS.map((fmt) => {
                    const selected = currentAudioFormat === fmt;
                    return (
                      <Item
                        key={fmt}
                        variant="outline"
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        onClick={() => setAudioFormat(fmt)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setAudioFormat(fmt);
                          }
                        }}
                        className={cn('cursor-pointer hover:bg-muted/40', selected && 'border-primary bg-primary/5 shadow-[0_0_0_2px_var(--brand-dim)]')}
                      >
                        <ItemContent>
                          <ItemTitle>{t(`playlistPresets.audioFormat.${fmt}`)}</ItemTitle>
                          <ItemDescription>{t(`playlistPresets.audioFormatDesc.${fmt}`)}</ItemDescription>
                        </ItemContent>
                      </Item>
                    );
                  })}
                </ItemGroup>
              </div>

              {/* Bitrate chips — lossy formats only */}
              {showBitrate && (
                <div>
                  <p className={SECTION_LABEL}>{t('wizard.formats.convert.bitrate')}</p>
                  <div className="flex flex-wrap gap-2">
                    {AUDIO_BITRATES.map((kbps) => (
                      <Button key={kbps} type="button" variant={currentBitrate === kbps ? 'default' : 'outline'} size="sm" onClick={() => setBitrate(kbps)} className={cn('rounded-full px-3', currentBitrate === kbps && 'shadow-[0_4px_14px_var(--brand-glow)]')}>
                        {kbps}K
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <WizardStepFooterActions onBack={back} onContinue={advance}>
        <Button type="button" onClick={skipToConfirm} title={t('wizard.formats.skipToConfirmTooltip')} className="shadow-[0_4px_14px_var(--brand-glow)]">
          {t('wizard.formats.skipToConfirm')}
        </Button>
      </WizardStepFooterActions>
    </div>
  );
}
