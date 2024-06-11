import { C } from '@angular/cdk/keycodes';
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
    {
      fileName: 'Sample 7',
      url: '/assets/audio/sample-7.mp3',
    },
  ];
  public playing = new BehaviorSubject<AudioFile>({
    fileName: '',
    url: '',
  });
  public audio$ = new BehaviorSubject(this.audioFiles);

  constructor() {}

  public addAudioFile(file: File, fileName?: string) {
    const url = URL.createObjectURL(file);
    this.audioFiles.push({
      fileName: fileName ? fileName : 'Audio',
      url,
    });
    this.audio$.next(this.audioFiles);
  }
}

export interface AudioFile {
  fileName: string;
  url: string;
}
