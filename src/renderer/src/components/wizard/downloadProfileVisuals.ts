import {Archive, BookOpen, Captions, Clapperboard, Download, FileAudio, Headphones, Music, Scissors, SlidersHorizontal, type LucideIcon} from 'lucide-react'
import type {DownloadProfileIcon} from '@shared/types.js'

export const PROFILE_ICONS: Record<DownloadProfileIcon, LucideIcon> = {archive: Archive, audio: FileAudio, captions: Captions, classes: BookOpen, clip: Scissors, controls: SlidersHorizontal, download: Download, music: Music, podcast: Headphones, video: Clapperboard}
