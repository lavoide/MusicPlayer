import { Component, ViewChild, inject, signal, computed } from '@angular/core';
import { AudioFile, AudioService } from '../shared/audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSelectionList } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
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
  styleUrls: ['./tracklist.component.scss'],
})
export class TracklistComponent {
  @ViewChild('songs') songsSelector!: MatSelectionList;
  private audioService = inject(AudioService);
  public audioEditorService = inject(AudioEditorService);
  public fileName = signal('');
  public tracklists!: Array<Tracklist>;
  public audio = this.audioService.audio$;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.audioEditorService.tracks$.subscribe((tracks) => {
      this.tracklists = tracks;
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName.set(file.name);
      this.audioService.addAudioFile(file, this.fileName());
    }
  }

  addToEditor(event: Event, song: AudioFile, trackIndex: number): void {
    this.audioEditorService.addToTracklist(trackIndex, song);
  }
}
