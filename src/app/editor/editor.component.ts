import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
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

  public seekTo(event: any, tracklist: Tracklist) {
    console.log(event.value);
  }

  public formatLabel = (value: number) => {
    return this.audioStreamService.formatTime(value);
  };

  public calcWidth = (track: AudioTrack, totalDuration: number): string => {
    const full = parseInt(this.trackWrapperElement.nativeElement.clientWidth);
    const ratio = track.duration / totalDuration;
    const resultWidth = ratio * full;
    return resultWidth + 'px';
  };

  public play = () => {
    this.audioEditorService.resume();
    // this.audioStreamService.play();
  };

  public playTracklist = () => {
    this.audioEditorService.playTracklist(0);
  };

  public pause = () => {
    this.audioEditorService.pause();
    // this.audioStreamService.pause();
  };

  public drop(event: CdkDragDrop<string[]>, index: number): void {
    console.log(event, index);
    moveItemInArray(
      this.tracklists[index].tracks,
      event.previousIndex,
      event.currentIndex
    );
    this.audioEditorService.tracks$.next(this.tracklists);
    this.audioEditorService.playTracklist(0);
  }
}
