import { Injectable } from '@angular/core';
import { signal, Signal, WritableSignal } from '@angular/core';
import moment from 'moment';
import { AudioFile, PlayList } from './audio.service';

@Injectable({
  providedIn: 'root',
})
export class AudioStreamService {
  private stop$ = signal(false);
  private audioObj = new Audio();
  audioEvents = [
    'ended',
    'error',
    'play',
    'playing',
    'pause',
    'timeupdate',
    'canplay',
    'loadedmetadata',
    'loadstart',
  ];
  private state: WritableSignal<StreamState> = signal<StreamState>({
    isPlaying: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canPlay: false,
    error: false,
    isLooping: false,
    playbackRate: 1,
    volume: 1,
    trackNumber: null,
    songName: '',
  });
  private playlist: WritableSignal<PlayList> = signal<PlayList>({
    name: '',
    tracks: [],
  });

  constructor() {
    this.addEvents(
      this.audioObj,
      this.audioEvents,
      this.updateStateEvents.bind(this)
    );
  }

  private addEvents(obj: any, events: any, handler: any) {
    events.forEach((event: any) => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj: any, events: any, handler: any) {
    events.forEach((event: any) => {
      obj.removeEventListener(event, handler);
    });
  }

  private streamAudio(file: AudioFile, load: boolean = false) {
    this.audioObj.src = file.url;
    this.audioObj.load();
    if (!load) {
      this.play();
    }
  }

  playStream(file: AudioFile, isPlaylist: boolean = false) {
    if (!isPlaylist) {
      this.state.set({ ...this.state(), trackNumber: null });
    }
    this.state.set({ ...this.state(), songName: file.fileName });
    this.streamAudio(file);
  }

  playFromPlaylist(playlist: PlayList, trackNumber: number) {
    this.playlist.set(playlist);
    this.state.set({ ...this.state(), trackNumber: trackNumber });
    this.playStream(playlist.tracks[trackNumber], true);
  }

  loadForCut(file: AudioFile) {
    this.streamAudio(file, true);
  }

  play() {
    this.audioObj.loop = this.state().isLooping;
    this.audioObj.playbackRate = this.state().playbackRate;
    this.audioObj.volume = this.state().volume;
    this.audioObj.play();
    this.state.set({ ...this.state(), isPlaying: true });
  }

  pause() {
    this.audioObj.pause();
    this.state.set({ ...this.state(), isPlaying: false });
  }

  stop() {
    this.stop$.set(true);
    this.pause();
    this.audioObj.currentTime = 0;
    this.resetState();
  }

  seekTo(seconds: number) {
    this.audioObj.currentTime = seconds;
  }

  loop(param: boolean) {
    this.audioObj.loop = param;
    this.state.set({ ...this.state(), isLooping: param });
  }

  changeRate(rate: number) {
    this.audioObj.playbackRate = rate;
    this.state.set({ ...this.state(), playbackRate: rate });
  }

  changeVolume(volume: number) {
    this.audioObj.volume = volume;
    this.state.set({ ...this.state(), volume: volume });
  }

  nextTrack() {
    const playlist = this.playlist();
    if (
      playlist &&
      this.state().trackNumber !== null &&
      playlist.tracks.length > this.state().trackNumber! + 1
    ) {
      const nextTrackNumber = this.state().trackNumber! + 1;
      this.state.set({ ...this.state(), trackNumber: nextTrackNumber });
      this.playStream(playlist.tracks[nextTrackNumber], true);
    }
  }

  previousTrack() {
    const playlist = this.playlist();
    if (
      playlist &&
      this.state().trackNumber !== null &&
      this.state().trackNumber! > 0
    ) {
      const prevTrackNumber = this.state().trackNumber! - 1;
      this.state.set({ ...this.state(), trackNumber: prevTrackNumber });
      this.playStream(playlist.tracks[prevTrackNumber], true);
    }
  }

  formatTime(time: number, format: string = 'HH:mm:ss') {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  private updateStateEvents(event: Event): void {
    const newState = { ...this.state() };

    switch (event.type) {
      case 'canplay':
        newState.duration = this.audioObj.duration;
        newState.readableDuration = this.formatTime(this.audioObj.duration);
        newState.canPlay = true;
        break;
      case 'playing':
        newState.isPlaying = true;
        break;
      case 'pause':
        newState.isPlaying = false;
        break;
      case 'timeupdate':
        newState.currentTime = this.audioObj.currentTime;
        newState.readableCurrentTime = this.formatTime(
          this.audioObj.currentTime
        );
        break;
      case 'error':
        this.resetState();
        newState.error = true;
        break;
    }

    this.state.set(newState);
  }

  private resetState() {
    this.state.set({
      isPlaying: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canPlay: false,
      error: false,
      isLooping: false,
      playbackRate: 1,
      volume: 1,
      trackNumber: this.playlist().tracks.length > 0 ? 0 : null,
      songName: '',
    });
  }

  getState(): Signal<StreamState> {
    return this.state;
  }

  getPlaylist(): Signal<PlayList | undefined> {
    return this.playlist;
  }
}

export interface StreamState {
  isPlaying: boolean;
  readableCurrentTime: string;
  readableDuration: string;
  duration: number | undefined;
  currentTime: number | undefined;
  canPlay: boolean;
  error: boolean;
  isLooping: boolean;
  playbackRate: number;
  volume: number;
  trackNumber: number | null;
  songName: string;
}
