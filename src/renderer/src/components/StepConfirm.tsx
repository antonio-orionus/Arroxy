import type { JSX } from 'react';
import { useAppStore, groupVideoFormats } from '../store/useAppStore';
import { Button } from './ui/button';

export function StepConfirm(): JSX.Element {
  const {
    wizardTitle,
    wizardThumbnail,
    wizardOutputDir,
    selectedVideoFormatId,
    selectedAudioQuality,
    activePreset,
    wizardFormats,
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

  const audioLabels: Record<string, string> = {
    best: 'Best audio',
    good: 'Good audio',
    low: 'Low audio',
    none: 'No audio'
  };

  const presetLabels: Record<string, string> = {
    'best-quality': 'Best quality',
    balanced: 'Balanced',
    'audio-only': 'Audio only',
    'small-file': 'Small file'
  };

  const formatSummary = activePreset
    ? presetLabels[activePreset]
    : selectedVideoFormatId === ''
      ? `Audio only · ${audioLabels[selectedAudioQuality]}`
      : `${videoResolution} · ${audioLabels[selectedAudioQuality]}`;

  return (
    <div className="wizard-step flex flex-col gap-4" data-testid="step-confirm">
      <div
        className="flex gap-4 items-start p-4 rounded-lg border border-zinc-700 bg-zinc-950"
        data-testid="confirm-preview"
      >
        {wizardThumbnail && (
          <img
            className="w-[120px] h-[68px] rounded object-cover border border-zinc-800 shrink-0"
            src={wizardThumbnail}
            alt=""
            aria-hidden
            data-testid="confirm-thumbnail"
          />
        )}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100 leading-snug" data-testid="confirm-title">
            {wizardTitle || 'Untitled video'}
          </p>
          <p className="text-xs text-zinc-400" data-testid="confirm-format">{formatSummary}</p>
          <p
            className="font-mono text-[11px] text-zinc-600 truncate"
            title={wizardOutputDir}
            data-testid="confirm-output-dir"
          >
            {wizardOutputDir}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={goBack} data-testid="btn-back">
          Back
        </Button>
        <Button variant="secondary" type="button" onClick={() => void addToQueue()} data-testid="btn-add-to-queue">
          Add to Queue
        </Button>
        <Button type="button" onClick={() => void addAndDownloadImmediately()} data-testid="btn-download-now">
          Add + Download Now
        </Button>
      </div>
    </div>
  );
}
