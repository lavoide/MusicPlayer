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
      tracks: [],
    },
  ];

  public tracks$ = new BehaviorSubject(this.tracklist);
  private currentTrackIndex: Array<number> = [0];
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

  public addTracklist() {
    this.pause();
    this.tracklist.push({ totalDuration: 0, currentTime: 0, tracks: [] });
    this.tracks$.next(this.tracklist);
    this.refresh();
  }

  public deleteTracklist(id: number) {
    this.pause();
    this.tracklist.splice(id, 1);
    this.tracks$.next(this.tracklist);
    this.refresh();
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

  public refresh(): void {
    this.currentTrackIndex = [];
    this.isPlaying$.next(false);

    // Pause and reset all tracks
    this.tracklist.forEach((tracklist, index) => {
      tracklist.tracks.forEach((track) => {
        track.audio.pause();
        track.audio.currentTime = 0;
        track.currentTime = 0;
      });
      tracklist.currentTime = 0;
      this.currentTrackIndex[index] = 0;
    });

    this.tracks$.next(this.tracklist);
    this.playTracklist();
  }

  public playTracklist() {
    this.tracklist.forEach((tracklist, index) => {
      this.currentTrackIndex[index] = 0;
      if (tracklist.tracks.length > 0) {
        this.playTrack(
          this.tracklist[index].tracks[this.currentTrackIndex[index]]
        );
      }
    });
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
    this.tracklist.forEach((tracklist, index) => {
      if (tracklist.tracks.length > 0) {
        tracklist.tracks[this.currentTrackIndex[index]].audio.pause();
      }
    });
    this.isPlaying$.next(false);
  }

  public resume() {
    this.tracklist.forEach((tracklist, index) => {
      if (tracklist.tracks.length > 0) {
        tracklist.tracks[this.currentTrackIndex[index]].audio.play();
      }
    });
    this.isPlaying$.next(true);
  }

  private onTrackTimeUpdate() {
    this.tracklist.forEach((tracklist, index) => {
      const currentTrack = tracklist.tracks[this.currentTrackIndex[index]];
      if (currentTrack?.audio) {
        currentTrack.currentTime = currentTrack.audio.currentTime;
        tracklist.currentTime = this.calculcateTotalCurrentTime(
          tracklist,
          this.currentTrackIndex[index],
          currentTrack.currentTime
        );
      }
    });
    this.tracks$.next(this.tracklist);
  }

  private onTrackEnded() {
    this.tracklist.forEach((tracklist, index) => {
      const currentTrack = tracklist.tracks[this.currentTrackIndex[index]];
      if (currentTrack?.audio) {
        currentTrack.audio.removeEventListener(
          'ended',
          this.onTrackEnded.bind(this)
        );
        currentTrack.audio.removeEventListener(
          'timeupdate',
          this.onTrackTimeUpdate.bind(this)
        );
      }
      if (this.currentTrackIndex[index] < tracklist.tracks.length - 1) {
        this.currentTrackIndex[index]++;
        this.playTrack(tracklist.tracks[this.currentTrackIndex[index]]);
      }
    });
  }

  public seekToTime(time: number) {
    this.tracklist.forEach((tracklist, index) => {
      const currentTrack = tracklist.tracks[this.currentTrackIndex[index]];
      if (currentTrack?.audio) {
        currentTrack.audio.pause();
        currentTrack.audio.currentTime = 0;
        currentTrack.audio.removeEventListener(
          'ended',
          this.onTrackEnded.bind(this)
        );
        currentTrack.audio.removeEventListener(
          'timeupdate',
          this.onTrackTimeUpdate.bind(this)
        );

        let cumulativeTime = 0;
        let newTrackIndex = 0;
        while (newTrackIndex < tracklist.tracks.length) {
          const track = tracklist.tracks[newTrackIndex];
          if (cumulativeTime + track.duration > time) {
            break;
          }
          cumulativeTime += track.duration;
          newTrackIndex++;
        }

        if (newTrackIndex < tracklist.tracks.length) {
          const newTrack = tracklist.tracks[newTrackIndex];
          const newTrackTime = time - cumulativeTime;
          newTrack.audio.currentTime = newTrackTime;

          this.currentTrackIndex[index] = newTrackIndex;
          this.tracks$.next(this.tracklist);
          this.playTrack(newTrack);
        } else {
          console.error('Specified time exceeds tracklist duration');
        }
      }
    });
  }

  public changeVolume(
    trackListIndex: number,
    trackIndex: number,
    volume: number
  ) {
    const tracklist = this.tracklist[trackListIndex];
    const track = tracklist.tracks[trackIndex];
    track.audio.volume = volume;
    track.volume = volume;
    this.tracks$.next(this.tracklist);
  }

  public changeRate(trackListIndex: number, trackIndex: number, rate: number) {
    const tracklist = this.tracklist[trackListIndex];
    const track = tracklist.tracks[trackIndex];
    track.audio.playbackRate = rate;
    track.playbackRate = rate;
    this.tracks$.next(this.tracklist);
  }

  public copyTrack(trackListIndex: number, trackIndex: number) {
    const tracklist = this.tracklist[trackListIndex];
    const track = tracklist.tracks[trackIndex];
    const copiedTrack: AudioTrack = {
      ...track,
      audio: new Audio(track.url),
    };

    tracklist.tracks.splice(trackIndex + 1, 0, copiedTrack);
    tracklist.totalDuration = this.calculateTotalDuration(tracklist);
    this.tracks$.next(this.tracklist);
  }

  public deleteTrack(trackListIndex: number, trackIndex: number) {
    const tracklist = this.tracklist[trackListIndex];
    tracklist.tracks.splice(trackIndex, 1);
    tracklist.totalDuration = this.calculateTotalDuration(tracklist);

    this.currentTrackIndex[trackListIndex] = 0;
    this.isPlaying$.next(false);

    this.tracklist.forEach((tracklist) => {
      tracklist.tracks.forEach((track) => {
        track.audio.pause();
        track.audio.currentTime = 0;
        track.currentTime = 0;
      });
      tracklist.currentTime = 0;
    });

    this.tracks$.next(this.tracklist);
    this.refresh();
  }

  public recalculateDurations() {
    this.tracklist.forEach((tracklist) => {
      tracklist.totalDuration = this.calculateTotalDuration(tracklist);
    });
    this.tracks$.next(this.tracklist);
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
