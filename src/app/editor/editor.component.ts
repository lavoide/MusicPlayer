import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  AudioEditorService,
  AudioTrack,
  Tracklist,
} from '../shared/audio-editor.service';
import { AudioStreamService } from '../shared/audio-stream.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatSliderModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  @ViewChild('track')
  trackWrapperElement!: ElementRef;
  private audioEditorService = inject(AudioEditorService);
  public audioStreamService = inject(AudioStreamService);
  public tracklists!: Array<Tracklist>;

  public currentTime: number = 0;
  public isPlaying: boolean = false;
  public isLoaded: boolean = false;

  constructor() {
    this.tracklists = this.audioEditorService.tracks$.getValue();
    this.isPlaying = this.audioEditorService.isPlaying$.getValue();
  }

  ngOnInit() {
    this.audioEditorService.tracks$.subscribe((tracks) => {
      this.tracklists = tracks;
    });
    this.audioEditorService.isPlaying$.subscribe((isPlaying) => {
      this.isPlaying = isPlaying;
    });
  }

  public seekTo(event: any, tracklistIndex: number) {
    this.audioEditorService.seekToTime(event.value, tracklistIndex);
  }

  public formatLabel = (value: number) => {
    return this.audioStreamService.formatTime(value);
  };

  public formatLabelSpeed = (value: number) => {
    return `x{${value}`;
  };

  public calcWidth = (track: AudioTrack, totalDuration: number): string => {
    const full = parseInt(this.trackWrapperElement.nativeElement.clientWidth);
    const ratio = track.duration / totalDuration;
    const resultWidth = ratio * full;
    return resultWidth + 'px';
  };

  public play = () => {
    this.audioEditorService.resume();
  };

  public playTracklist = () => {
    this.audioEditorService.refresh(0);
    this.isLoaded = true;
  };

  public pause = () => {
    this.audioEditorService.pause();
  };

  public drop(event: CdkDragDrop<string[]>, index: number): void {
    if (!this.isLoaded) return;
    moveItemInArray(
      this.tracklists[index].tracks,
      event.previousIndex,
      event.currentIndex
    );
    this.audioEditorService.tracks$.next(this.tracklists);
    this.audioEditorService.refresh(0);
  }

  public changeVolume = (
    trackListIndex: number,
    trackIndex: number,
    volume: number
  ) => {
    this.audioEditorService.changeVolume(trackListIndex, trackIndex, volume);
  };

  public changeRate = (
    trackListIndex: number,
    trackIndex: number,
    rate: number
  ) => {
    this.audioEditorService.changeRate(trackListIndex, trackIndex, rate);
  };

  public copyTrack = (trackListIndex: number, trackIndex: number) => {
    this.audioEditorService.copyTrack(trackListIndex, trackIndex);
  };

  public deleteTrack = (trackListIndex: number, trackIndex: number) => {
    this.audioEditorService.deleteTrack(trackListIndex, trackIndex);
  };
}
