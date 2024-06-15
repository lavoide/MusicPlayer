import { Component, ViewChild, inject } from '@angular/core';
import { AudioFile, AudioService } from '../shared/audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSelectionList } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import {
  AudioStreamService,
  StreamState,
} from '../shared/audio-stream.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AudioEditorService, Tracklist } from '../shared/audio-editor.service';

@Component({
  selector: 'app-tracklist',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './tracklist.component.html',
  styleUrl: './tracklist.component.scss',
})
export class TracklistComponent {
  @ViewChild('songs')
  songsSelector!: MatSelectionList;
  private audioService = inject(AudioService);
  public audioEditorService = inject(AudioEditorService);
  public fileName = '';
  public tracklists!: Array<Tracklist>;

  public audio = [] as any;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.audioService.audio$.subscribe((audio) => {
      this.audio = audio;
    });
    this.audioEditorService.tracks$.subscribe((tracks) => {
      this.tracklists = tracks;
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.audioService.addAudioFile(file, this.fileName);
    }
  }

  addToEditor(event: Event, song: AudioFile, trackIndex: number): void {
    this.audioEditorService.addToTracklist(trackIndex, song);
  }
}
