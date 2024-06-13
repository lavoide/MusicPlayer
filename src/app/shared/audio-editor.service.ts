import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioEditorService {
  private tracklist: Array<Tracklist> = [
    {
      totalDuration: 600,
      currentTime: 0,
      tracks: [
        {
          fileName: 'Sample 5',
          url: '/assets/audio/sample-5.mp3',
          duration: 15000,
          volume: 100,
          playbackRate: 1,
          detune: 0,
        },
        {
          fileName: 'Sample 6',
          url: '/assets/audio/sample-6.mp3',
          duration: 15000,
          volume: 100,
          playbackRate: 1,
          detune: 0,
        },
        {
          fileName: 'Sample 7',
          url: '/assets/audio/sample-7.mp3',
          duration: 15000,
          volume: 100,
          playbackRate: 1,
          detune: 0,
        },
      ],
    },
  ];

  public tracks$ = new BehaviorSubject(this.tracklist);

  constructor() {}
}

export interface AudioTrack {
  fileName: string;
  url: string;
  duration: number;
  volume: number;
  playbackRate: number;
  detune: number;
}

export interface Tracklist {
  totalDuration: number;
  currentTime: number;
  tracks: AudioTrack[];
}
