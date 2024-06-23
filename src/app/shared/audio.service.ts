import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioFiles = signal<Array<AudioFile>>([
    { fileName: 'Sample 1', url: '/assets/audio/sample-1.mp3' },
    { fileName: 'Sample 2', url: '/assets/audio/sample-2.mp3' },
    { fileName: 'Sample 3', url: '/assets/audio/sample-3.mp3' },
    { fileName: 'Sample 4', url: '/assets/audio/sample-4.mp3' },
    { fileName: 'Sample 5', url: '/assets/audio/sample-5.mp3' },
    { fileName: 'Sample 6', url: '/assets/audio/sample-6.mp3' },
  ]);

  private playlists = signal<Array<PlayList>>([
    {
      name: 'Test playlist',
      tracks: [
        { fileName: 'Sample 3', url: '/assets/audio/sample-3.mp3' },
        { fileName: 'Sample 4', url: '/assets/audio/sample-4.mp3' },
        { fileName: 'Sample 5', url: '/assets/audio/sample-5.mp3' },
        { fileName: 'Sample 6', url: '/assets/audio/sample-6.mp3' },
        { fileName: 'Sample 7', url: '/assets/audio/sample-7.mp3' },
      ],
    },
  ]);

  public playing = signal<AudioFile>({ fileName: '', url: '' });
  public audio$ = computed(() => this.audioFiles());
  public playlists$ = computed(() => this.playlists());

  constructor() {}

  public addAudioFile(file: File, fileName?: string) {
    const url = URL.createObjectURL(file);
    this.audioFiles.update((files) => [
      ...files,
      { fileName: fileName || 'Audio', url },
    ]);
  }

  public addToPlaylist(playlist: PlayList, tracks: Array<AudioFile>) {
    this.playlists.update((playlists) => {
      const index = playlists.findIndex((p) => p.name === playlist.name);
      if (index !== -1) {
        const updatedTracks = [
          ...playlists[index].tracks,
          ...tracks.filter((track) => !playlists[index].tracks.includes(track)),
        ];
        const updatedPlaylist = { ...playlists[index], tracks: updatedTracks };
        return [
          ...playlists.slice(0, index),
          updatedPlaylist,
          ...playlists.slice(index + 1),
        ];
      }
      return playlists;
    });
  }

  public addPlaylist(playlist: PlayList) {
    this.playlists.update((playlists) => [...playlists, playlist]);
  }

  public reorderPlaylist(playlists: Array<PlayList>) {
    this.playlists.set(playlists);
  }
}

export interface AudioFile {
  fileName: string;
  url: string;
}

export interface PlayList {
  name: string;
  tracks: Array<AudioFile>;
}
