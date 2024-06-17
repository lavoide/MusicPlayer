import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
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
    MatTooltipModule,
    CdkDropListGroup,
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
  public hasSongs: boolean = false;
  public maxDuration: number = 0;
  public longestTracklist: number = 0;
  public compositionRate: number = 1;

  constructor(private _cdr: ChangeDetectorRef) {
    this.tracklists = this.audioEditorService.tracks$.getValue();
    this.isPlaying = this.audioEditorService.isPlaying$.getValue();
  }

  ngOnInit() {
    this.audioEditorService.tracks$.subscribe((tracks) => {
      this.tracklists = tracks;
      this.hasSongs = this.checkSongs();
      this.maxDuration = this.calculateMaxDuration();
      let longest = 0;
      let id = 0;
      tracks.forEach((track, index) => {
        if (track.totalDuration > longest) {
          longest = track.totalDuration;
          id = index;
        }
      });
      this.longestTracklist = id;
      this._cdr.detectChanges();
    });
    this.audioEditorService.isPlaying$.subscribe((isPlaying) => {
      this.isPlaying = isPlaying;
      this._cdr.detectChanges();
    });
  }

  public seekTo(event: any) {
    this.audioEditorService.seekToTime(event.value);
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
    this.audioEditorService.refresh(true);
    this.isLoaded = true;
  };

  public pause = () => {
    this.audioEditorService.pause();
  };

  public drop(event: CdkDragDrop<AudioTrack[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.audioEditorService.tracks$.next(this.tracklists);
    this.audioEditorService.recalculateDurations();
    if (this.isLoaded) {
      this.audioEditorService.refresh();
    }
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

  public changeCompositionRate = (event: any) => {
    this.compositionRate = event.value;
    this.audioEditorService.changeCompositionRate(this.compositionRate);
  };

  public changeTracklistRate = (event: any, tracklistIndex: number) => {
    this.audioEditorService.changeTracklistRate(event.value, tracklistIndex);
  };

  public copyTrack = (trackListIndex: number, trackIndex: number) => {
    this.audioEditorService.copyTrack(trackListIndex, trackIndex);
  };

  public deleteTrack = (trackListIndex: number, trackIndex: number) => {
    this.audioEditorService.deleteTrack(trackListIndex, trackIndex);
  };

  public checkSongs = () => {
    let hasSongs = false;
    this.tracklists.forEach((tracklist) => {
      if (tracklist.tracks.length > 0) {
        hasSongs = true;
      }
    });
    return hasSongs;
  };

  public calculateMaxDuration() {
    let maxDuration = 0;
    this.tracklists.forEach((tracklist) => {
      const totalDuration = tracklist.totalDuration;
      if (totalDuration > maxDuration) {
        maxDuration = totalDuration;
      }
    });
    return maxDuration;
  }

  public addTrackList() {
    this.audioEditorService.addTracklist();
  }

  public deleteTrackList(i: number) {
    this.audioEditorService.deleteTracklist(i);
  }
}
