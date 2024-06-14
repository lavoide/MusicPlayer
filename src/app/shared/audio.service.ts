import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioFiles: Array<AudioFile> = [
    {
      fileName: 'Sample 1',
      url: '/assets/audio/sample-1.mp3',
    },
    {
      fileName: 'Sample 2',
      url: '/assets/audio/sample-2.mp3',
    },
    {
      fileName: 'Sample 3',
      url: '/assets/audio/sample-3.mp3',
    },
    {
      fileName: 'Sample 4',
      url: '/assets/audio/sample-4.mp3',
    },
    {
      fileName: 'Sample 5',
      url: '/assets/audio/sample-5.mp3',
    },
    {
      fileName: 'Sample 6',
      url: '/assets/audio/sample-6.mp3',
    },
  ];

  private playlists: Array<PlayList> = [
    {
      name: 'Test playlist',
      tracks: [
        {
          fileName: 'Sample 3',
          url: '/assets/audio/sample-3.mp3',
        },
        {
          fileName: 'Sample 4',
          url: '/assets/audio/sample-4.mp3',
        },
        {
          fileName: 'Sample 5',
          url: '/assets/audio/sample-5.mp3',
        },
        {
          fileName: 'Sample 6',
          url: '/assets/audio/sample-6.mp3',
        },
        {
          fileName: 'Sample 7',
          url: '/assets/audio/sample-7.mp3',
        },
      ],
    },
  ];

  public playing = new BehaviorSubject<AudioFile>({
    fileName: '',
    url: '',
  });
  public audio$ = new BehaviorSubject(this.audioFiles);
  public playlists$ = new BehaviorSubject(this.playlists);

  constructor() {}

  public addAudioFile(file: File, fileName?: string) {
    const url = URL.createObjectURL(file);
    this.audioFiles.push({
      fileName: fileName ? fileName : 'Audio',
      url,
    });
    this.audio$.next(this.audioFiles);
  }

  public addToPlaylist(playlist: PlayList, tracks: Array<AudioFile>) {
    const index = this.playlists.indexOf(playlist);
    if (index !== -1) {
      tracks.forEach(track => {
        if(!this.playlists[index].tracks.includes(track)) {
          this.playlists[index].tracks.push(track);
        }
     })
    }
    this.playlists$.next(this.playlists);
  }

  public addPlaylist(playlist: PlayList) {
    this.playlists.push(playlist);
    this.playlists$.next(this.playlists);
  }

  reorderPlaylist(playlists: Array<PlayList>) {
    this.playlists$.next(playlists);
  }
}

export interface AudioFile {
  fileName: string;
  url: string;
}

export interface PlayList {
  name: string;
  tracks: Array<AudioFile | never>;
}
