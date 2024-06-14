import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AudioFile } from './audio.service';

@Injectable({
  providedIn: 'root',
})
export class AudioEditorService {
  private tracklist: Array<Tracklist> = [
    {
      totalDuration: 0,
      currentTime: 0,
      tracks: [
        // {
        //   fileName: 'Sample 5',
        //   url: '/assets/audio/sample-5.mp3',
        //   audio: new Audio('/assets/audio/sample-5.mp3'),
        //   duration: 100,
        //   volume: 100,
        //   playbackRate: 1,
        //   detune: 0,
        // },
        // {
        //   fileName: 'Sample 6',
        //   url: '/assets/audio/sample-6.mp3',
        //   audio: new Audio('/assets/audio/sample-6.mp3'),
        //   duration: 100,
        //   volume: 100,
        //   playbackRate: 1,
        //   detune: 0,
        // },
        // {
        //   fileName: 'Sample 7',
        //   url: '/assets/audio/sample-7.mp3',
        //   audio: new Audio('/assets/audio/sample-7.mp3'),
        //   duration: 100,
        //   volume: 100,
        //   playbackRate: 1,
        //   detune: 0,
        // },
      ],
    },
  ];

  public tracks$ = new BehaviorSubject(this.tracklist);
  private currentTracklistIndex: number = 0;
  private currentTrackIndex: number = 0;
  public isPlaying$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {}

  public async addToTracklist(index: number, song: AudioFile) {
    if (this.tracklist.length - 1 >= index) {
      this.tracklist[index].tracks.push(await this.convertToTrack(song));
      this.tracklist[index].totalDuration = this.calculateTotalDuration(
        this.tracklist[index]
      );
      this.tracks$.next(this.tracklist);
    }
  }

  public convertToTrack(song: AudioFile): Promise<AudioTrack> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(song.url);

      audio.addEventListener('loadedmetadata', () => {
        const track: AudioTrack = {
          fileName: song.fileName,
          url: song.url,
          audio,
          duration: audio.duration,
          volume: audio.volume,
          playbackRate: audio.playbackRate,
          currentTime: audio.currentTime,
          detune: 0,
        };
        resolve(track);
      });

      audio.addEventListener('error', (e) => {
        reject(new Error('Error loading audio metadata.'));
      });
    });
  }

  public calculateTotalDuration(tracklist: Tracklist): number {
    let total = 0;
    tracklist.tracks.forEach((track) => {
      total += track.duration;
    });
    return total;
  }

  private calculcateTotalCurrentTime(
    tracklist: Tracklist,
    index: number,
    songTime: number
  ): number {
    let time = 0;
    if (index === 0) {
      time = songTime;
    } else {
      for (let i = 0; i < index; i++) {
        time += tracklist.tracks[i].duration;
      }
      time += songTime;
    }
    return time;
  }

  public playTracklist(index: number) {
    if (index < this.tracklist.length) {
      this.currentTracklistIndex = index;
      this.currentTrackIndex = 0;
      this.playTrack(this.tracklist[index].tracks[this.currentTrackIndex]);
    }
  }

  private playTrack(track: AudioTrack) {
    track.audio.play();
    this.isPlaying$.next(true);
    track.audio.addEventListener('ended', this.onTrackEnded.bind(this));
    track.audio.addEventListener(
      'timeupdate',
      this.onTrackTimeUpdate.bind(this)
    );
  }

  public pause() {
    this.tracklist[this.currentTracklistIndex].tracks[
      this.currentTrackIndex
    ].audio.pause();
    this.isPlaying$.next(false);
  }

  public resume() {
    this.tracklist[this.currentTracklistIndex].tracks[
      this.currentTrackIndex
    ].audio.play();
    this.isPlaying$.next(true);
  }

  private onTrackTimeUpdate() {
    const tracklist = this.tracklist[this.currentTracklistIndex];
    const currentTrack = tracklist.tracks[this.currentTrackIndex];
    currentTrack.currentTime = currentTrack.audio.currentTime;
    tracklist.currentTime = this.calculcateTotalCurrentTime(
      tracklist,
      this.currentTrackIndex,
      currentTrack.currentTime
    );
    this.tracks$.next(this.tracklist);
  }

  private onTrackEnded() {
    console.log('onTrackEnded');
    const tracklist = this.tracklist[this.currentTracklistIndex];
    const currentTrack = tracklist.tracks[this.currentTrackIndex];
    console.log(
      'currentTrack',
      this.currentTracklistIndex,
      this.currentTrackIndex,
      currentTrack
    );

    currentTrack.audio.removeEventListener(
      'ended',
      this.onTrackEnded.bind(this)
    );
    currentTrack.audio.removeEventListener(
      'timeupdate',
      this.onTrackTimeUpdate.bind(this)
    );

    this.currentTrackIndex++;
    if (this.currentTrackIndex < tracklist.tracks.length) {
      this.playTrack(tracklist.tracks[this.currentTrackIndex]);
    }
  }
}

export interface AudioTrack {
  fileName: string;
  url: string;
  audio: HTMLAudioElement;
  duration: number;
  volume: number;
  playbackRate: number;
  detune: number;
  currentTime: number;
}

export interface Tracklist {
  totalDuration: number;
  currentTime: number;
  tracks: AudioTrack[];
}
