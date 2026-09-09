export interface Chapter {
  id: string;
  number: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  scrollStart: number;
  scrollEnd: number;
  badge?: string;
  thumbnailDesc: string;
}

export interface SoundState {
  isPlaying: boolean;
  volume: number;
}
