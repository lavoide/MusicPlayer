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
      tracklistRate: 1,
      tracks: [],
    },
  ];
  private audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

  public tracks$ = new BehaviorSubject(this.tracklist);
  private currentTrackIndex: Array<number> = [0];
  public isPlaying$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private timeUpdateInterval: any;

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
    this.tracklist.push({
      totalDuration: 0,
      currentTime: 0,
      tracklistRate: 1,
      tracks: [],
    });
    this.tracks$.next(this.tracklist);
    this.refresh();
  }

  public deleteTracklist(id: number) {
    this.pause();
    this.tracklist.splice(id, 1);
    this.tracks$.next(this.tracklist);
    this.refresh();
  }

  public async convertToTrack(song: AudioFile): Promise<AudioTrack> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(song.url);
      const audioContext = this.audioContext;

      audio.addEventListener('loadedmetadata', async () => {
        const arrayBuffer = await fetch(song.url).then((res) =>
          res.arrayBuffer()
        );
        audioContext.decodeAudioData(
          arrayBuffer,
          (audioBuffer) => {
            const track: AudioTrack = {
              fileName: song.fileName,
              url: song.url,
              audio,
              duration: audio.duration,
              volume: audio.volume,
              playbackRate: audio.playbackRate,
              currentTime: audio.currentTime,
              detune: 0,
              audioBuffer,
              sourceNode: null,
              gainNode: null,
              startTime: 0,
            };
            resolve(track);
          },
          (error) => {
            reject(new Error('Error decoding audio data.'));
          }
        );
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

  public refresh(play: boolean = false): void {
    this.currentTrackIndex = [];
    this.isPlaying$.next(false);
    clearInterval(this.timeUpdateInterval);

    // Pause and reset all tracks
    this.tracklist.forEach((tracklist, index) => {
      tracklist.tracks.forEach((track) => {
        if (track.sourceNode) {
          track.sourceNode.stop();
          track.sourceNode.disconnect();
          track.sourceNode = null;
        }
        if (track.gainNode) {
          track.gainNode.disconnect();
          track.gainNode = null;
        }
        track.currentTime = 0;
      });
      tracklist.currentTime = 0;
      this.currentTrackIndex[index] = 0;
    });

    this.tracks$.next(this.tracklist);
    if (play) {
      this.playTracklist();
    }
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
    const sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = track.audioBuffer;
    sourceNode.playbackRate.value = track.playbackRate;
    sourceNode.detune.value = track.detune;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = track.volume;

    sourceNode.connect(gainNode).connect(this.audioContext.destination);

    track.sourceNode = sourceNode;
    track.gainNode = gainNode;
    track.startTime = this.audioContext.currentTime;

    sourceNode.start();

    sourceNode.onended = () => this.onTrackEnded(track);
    this.isPlaying$.next(true);

    this.timeUpdateInterval = setInterval(() => {
      this.onTrackTimeUpdate();
    }, 1000);
  }

  public pause() {
    this.tracklist.forEach((tracklist, index) => {
      if (tracklist.tracks.length > 0) {
        const currentTrack = tracklist.tracks[this.currentTrackIndex[index]];
        if (currentTrack?.sourceNode) {
          currentTrack.currentTime =
            this.audioContext.currentTime - currentTrack.startTime;
          currentTrack.sourceNode.stop();
          currentTrack.sourceNode = null;
        }
      }
    });
    this.isPlaying$.next(false);

    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  public resume() {
    this.tracklist.forEach((tracklist, index) => {
      if (tracklist.tracks.length > 0) {
        const currentTrack = tracklist.tracks[this.currentTrackIndex[index]];
        if (currentTrack) {
          const offset = currentTrack.currentTime;
          this.playTrackFromOffset(currentTrack, offset);
        }
      }
    });
    this.isPlaying$.next(true);
  }

  private onTrackTimeUpdate() {
    this.tracklist.forEach((tracklist, index) => {
      const currentTrack = tracklist.tracks[this.currentTrackIndex[index]];
      if (currentTrack?.sourceNode) {
        const elapsedTime =
          this.audioContext.currentTime - currentTrack.startTime;
        currentTrack.currentTime = elapsedTime;
        tracklist.currentTime = this.calculcateTotalCurrentTime(
          tracklist,
          this.currentTrackIndex[index],
          currentTrack.currentTime
        );
      }
    });
    this.tracks$.next(this.tracklist);
  }

  private onTrackEnded(track: AudioTrack) {
    const tracklistIndex = this.tracklist.findIndex((tracklist) =>
      tracklist.tracks.includes(track)
    );
    if (tracklistIndex !== -1 && this.isPlaying$.getValue()) {
      const tracklist = this.tracklist[tracklistIndex];
      const trackIndex = tracklist.tracks.indexOf(track);
      if (trackIndex !== -1 && trackIndex < tracklist.tracks.length - 1) {
        this.currentTrackIndex[tracklistIndex]++;
        this.playTrack(
          tracklist.tracks[this.currentTrackIndex[tracklistIndex]]
        );
      }
    }
  }

  public seekToTime(time: number) {
    this.tracklist.forEach((tracklist, index) => {
      const currentTrack = tracklist.tracks[this.currentTrackIndex[index]];
      if (currentTrack?.sourceNode) {
        currentTrack.sourceNode.onended = null;
        currentTrack.sourceNode.stop();
        currentTrack.sourceNode = null;
      }

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
        newTrack.startTime = this.audioContext.currentTime - newTrackTime;

        this.currentTrackIndex[index] = newTrackIndex;
        this.tracks$.next(this.tracklist);
        this.playTrackFromOffset(newTrack, newTrackTime);
      } else {
        console.error('Specified time exceeds tracklist duration');
      }
    });
  }

  private playTrackFromOffset(track: AudioTrack, offset: number) {
    const sourceNode = this.audioContext.createBufferSource();
    sourceNode.buffer = track.audioBuffer;
    sourceNode.playbackRate.value = track.playbackRate;
    sourceNode.detune.value = track.detune;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = track.volume;

    sourceNode.connect(gainNode).connect(this.audioContext.destination);

    track.sourceNode = sourceNode;
    track.gainNode = gainNode;
    track.startTime = this.audioContext.currentTime - offset;

    sourceNode.onended = () => this.onTrackEnded(track);

    sourceNode.start(0, offset);
    this.isPlaying$.next(true);

    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }

    this.timeUpdateInterval = setInterval(() => {
      this.onTrackTimeUpdate();
    }, 1000);
  }

  public changeVolume(
    trackListIndex: number,
    trackIndex: number,
    volume: number
  ) {
    const tracklist = this.tracklist[trackListIndex];
    const track = tracklist.tracks[trackIndex];
    track.volume = volume;
    if (track.gainNode) {
      track.gainNode.gain.value = volume;
    }
    this.tracks$.next(this.tracklist);
  }

  public changeRate(trackListIndex: number, trackIndex: number, rate: number) {
    const tracklist = this.tracklist[trackListIndex];
    const track = tracklist.tracks[trackIndex];
    track.playbackRate = rate;
    if (track.sourceNode) {
      track.sourceNode.playbackRate.value = rate;
    }
    this.tracks$.next(this.tracklist);
  }

  public changePitch(
    trackListIndex: number,
    trackIndex: number,
    detune: number
  ) {
    const tracklist = this.tracklist[trackListIndex];
    const track = tracklist.tracks[trackIndex];
    track.detune = detune;
    if (track.sourceNode) {
      track.sourceNode.detune.value = detune;
    }
    this.tracks$.next(this.tracklist);
  }

  public changeCompositionRate(rate: number) {
    this.tracklist.forEach((tracklist) => {
      tracklist.tracks.forEach((track) => {
        track.playbackRate = rate;
        if (track.sourceNode) {
          track.sourceNode.playbackRate.value = rate;
        }
      });
      tracklist.tracklistRate = rate;
    });
    this.tracks$.next(this.tracklist);
  }

  public changeTracklistRate(rate: number, trackListIndex: number) {
    this.tracklist[trackListIndex].tracks.forEach((track) => {
      track.playbackRate = rate;
      if (track.sourceNode) {
        track.sourceNode.playbackRate.value = rate;
      }
    });
    this.tracklist[trackListIndex].tracklistRate = rate;
    this.tracks$.next(this.tracklist);
  }

  public copyTrack(trackListIndex: number, trackIndex: number) {
    const tracklist = this.tracklist[trackListIndex];
    const track = tracklist.tracks[trackIndex];
    const copiedTrack: AudioTrack = {
      ...track,
      audio: new Audio(track.url),
      audioBuffer: track.audioBuffer,
      sourceNode: null,
      gainNode: null,
      startTime: 0,
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
        if (track.sourceNode) {
          track.sourceNode.stop();
          track.sourceNode = null;
        }
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
  audioBuffer: AudioBuffer;
  sourceNode: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  startTime: number;
}

export interface Tracklist {
  totalDuration: number;
  currentTime: number;
  tracklistRate: number;
  tracks: AudioTrack[];
}
