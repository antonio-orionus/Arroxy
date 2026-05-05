import type { AudioConvert } from './schemas';
import { isLossyTarget } from './audioTargets';

export interface EmbedPolicyInput {
  embedMetadata?: boolean;
  embedThumbnail?: boolean;
  audioConvert?: AudioConvert;
}

export interface ResolvedEmbed {
  embedMetadata: boolean;
  embedThumbnail: boolean;
}

// For lossy audio conversions (mp3/m4a/opus) metadata + thumbnail default ON
// unless the user explicitly opted out. wav skips thumbnail embed. Native
// audio + video downloads use the user's literal toggle state.
export function resolveEmbedPolicy(input: EmbedPolicyInput): ResolvedEmbed {
  const { embedMetadata, embedThumbnail, audioConvert } = input;
  if (!audioConvert) {
    return { embedMetadata: !!embedMetadata, embedThumbnail: !!embedThumbnail };
  }
  const isMusic = isLossyTarget(audioConvert.target);
  return {
    embedMetadata: embedMetadata !== false,
    embedThumbnail: isMusic && embedThumbnail !== false
  };
}
