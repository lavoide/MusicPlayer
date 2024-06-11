import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AudioStreamService {
  private stop$ = new Subject();
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
  private state: StreamState = {
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
  };

  private streamObservable(url: any) {
    return new Observable((observer) => {
      this.audioObj.src = url;
      this.audioObj.load();
      this.play();

      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };

      this.addEvents(this.audioObj, this.audioEvents, handler);
      return () => {
        this.pause();
        this.audioObj.currentTime = 0;
        this.removeEvents(this.audioObj, this.audioEvents, handler);
        this.resetState();
      };
    });
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

  playStream(url: any) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }

  play() {
    this.audioObj.loop = this.state.isLooping;
    this.audioObj.playbackRate = this.state.playbackRate;
    this.audioObj.volume = this.state.volume;
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.stop$.next(true);
  }

  seekTo(seconds: number) {
    this.audioObj.currentTime = seconds;
  }

  loop(param: boolean) {
    this.audioObj.loop = param;
    this.state.isLooping = param;
    this.stateChange.next(this.state);
  }

  changeRate(rate: number) {
    this.audioObj.playbackRate = rate;
    this.state.playbackRate = rate;
    this.stateChange.next(this.state);
  }

  changeVolume(volume: number) {
    this.audioObj.volume = volume;
    this.state.volume = volume;
    this.stateChange.next(this.state);
  }

  formatTime(time: number, format: string = 'HH:mm:ss') {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(
    this.state
  );

  private updateStateEvents(event: Event): void {
    switch (event.type) {
      case 'canplay':
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canPlay = true;
        break;
      case 'playing':
        this.state.isPlaying = true;
        break;
      case 'pause':
        this.state.isPlaying = false;
        break;
      case 'timeupdate':
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(
          this.state.currentTime
        );
        break;
      case 'error':
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);
  }

  private resetState() {
    this.state = {
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
    };
  }

  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
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
}
