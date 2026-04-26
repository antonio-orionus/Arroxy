import type { JSX } from 'react';
import { useAppStore, groupVideoFormats } from '../store/useAppStore';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { VideoSummaryCard } from './VideoSummaryCard';
import loveImg from '../assets/Love.png';

function humanSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) { value /= 1024; idx += 1; }
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export function StepConfirm(): JSX.Element {
  const {
    wizardTitle,
    wizardThumbnail,
    wizardDuration,
    wizardOutputDir,
    selectedVideoFormatId,
    selectedAudioFormatId,
    activePreset,
    wizardFormats,
    commonPaths,
    addToQueue,
    addAndDownloadImmediately
  } = useAppStore();

  function goBack(): void {
    useAppStore.setState({ wizardStep: 'folder' });
  }

  const videoGroups = groupVideoFormats(wizardFormats).filter((g) => !g.isAudioOnly);
  const videoResolution =
    selectedVideoFormatId === ''
      ? 'Audio only'
      : videoGroups.find((g) => g.formatId === selectedVideoFormatId)?.resolution ?? selectedVideoFormatId;

  const audioFormat = wizardFormats.find((f) => f.formatId === selectedAudioFormatId);
  const audioLabel = selectedAudioFormatId === null ? 'No audio' : (audioFormat?.label ?? 'Audio');

  const presetLabels: Record<string, string> = {
    'best-quality': 'Best quality',
    balanced: 'Balanced',
    'audio-only': 'Audio only',
    'small-file': 'Small file'
  };

  const videoSummary = activePreset
    ? presetLabels[activePreset]
    : selectedVideoFormatId === ''
      ? 'Audio only'
      : videoResolution;

  const selectedFormat = wizardFormats.find((f) => f.formatId === selectedVideoFormatId);
  const estimatedSize = selectedFormat?.filesize ? `~${humanSize(selectedFormat.filesize)}` : 'Unknown';

  // Shorten path for display
  const homeBase = commonPaths?.downloads?.replace(/[/\\][^/\\]+$/, '') ?? '';
  const shortPath = homeBase && wizardOutputDir.startsWith(homeBase)
    ? wizardOutputDir.replace(homeBase, '~')
    : wizardOutputDir;

  const summaryRows: [string, string][] = [
    ['Video', videoSummary],
    ['Audio', audioLabel],
    ['Save to', shortPath],
    ['Size', estimatedSize],
  ];

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-confirm">
      <VideoSummaryCard
        thumbnail={wizardThumbnail}
        title={wizardTitle}
        duration={wizardDuration}
        resolution={selectedVideoFormatId !== '' ? videoResolution : undefined}
      />

      {/* Mascot banner */}
      <div className="flex items-center gap-4 p-4 rounded-lg border border-[hsla(220,100%,56%,0.15)] bg-[var(--brand-dim)] shrink-0">
        <img src={loveImg} alt="" aria-hidden className="w-16 h-16 object-contain shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Ready to pull it in!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your file will land in{' '}
            <code className="font-mono text-foreground/80">{shortPath}</code>
          </p>
        </div>
      </div>

      {/* Summary table */}
      <div className="rounded-lg border border-border bg-secondary overflow-hidden" data-testid="confirm-preview">
        <table className="w-full">
          <tbody>
            {summaryRows.map(([label, value]) => (
              <tr key={label} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)] w-16 whitespace-nowrap">
                  {label}
                </td>
                <td
                  className="px-4 py-2 text-xs text-foreground/80 font-mono truncate max-w-xs"
                  data-testid={`confirm-${label.toLowerCase().replace(' ', '-')}`}
                >
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 sticky bottom-0 bg-background py-3 -mx-6 px-6 border-t border-border/50">
        <Button
          variant="ghost"
          type="button"
          onClick={goBack}
          data-testid="btn-back"
          className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground mr-auto"
        >
          Back
        </Button>
        <Tooltip>
          <TooltipTrigger render={(props) => (
            <Button
              {...props}
              variant="outline"
              type="button"
              onClick={() => void addToQueue()}
              data-testid="btn-add-to-queue"
            >
              + Queue
            </Button>
          )} />
          <TooltipContent>Starts when other downloads finish — gets full bandwidth</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={(props) => (
            <Button
              {...props}
              type="button"
              size="lg"
              onClick={() => void addAndDownloadImmediately()}
              data-testid="btn-download-now"
              className="shadow-[0_4px_14px_var(--brand-glow)]"
            >
              Pull it! ↓
            </Button>
          )} />
          <TooltipContent>Starts immediately — runs alongside other active downloads</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
