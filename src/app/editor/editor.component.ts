import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSliderModule } from '@angular/material/slider';
import { AudioEditorService, Tracklist } from '../shared/audio-editor.service';
import { AudioStreamService } from '../shared/audio-stream.service';
import moment from 'moment';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [MatToolbarModule, MatSliderModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  private audioEditorService = inject(AudioEditorService);
  public audioStreamService = inject(AudioStreamService);
  public tracklists!: Array<Tracklist>;

  public currentTime: number = 0;

  constructor() {
    this.tracklists = this.audioEditorService.tracks$.getValue();
  }

  onSliderChangeEnd(event: any) {}

  formatLabel = (value: number) => {
    return this.audioStreamService.formatTime(value);
  };
}
