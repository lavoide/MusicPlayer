import { Component, ViewChild, inject } from '@angular/core';
import { AudioFile, AudioService, PlayList } from '../shared/audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSelectionList } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import {
  AudioStreamService,
  StreamState,
} from '../shared/audio-stream.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

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
  ],
  templateUrl: './tracklist.component.html',
  styleUrl: './tracklist.component.scss',
})
export class TracklistComponent {
  @ViewChild('songs')
  songsSelector!: MatSelectionList;
  private audioService = inject(AudioService);
  public audioStreamService = inject(AudioStreamService);
  public state: StreamState | undefined;

  public fileName = '';
  public playlistName = '';
  public cutStart = 0;
  public cutEnd = 0;

  public audio = [] as any;
  public playlists = [] as any;
  public audioContext = new AudioContext();
  public selectedSongs = [] as any;
  public playlistsState = [] as any;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.audioService.audio$.subscribe((audio) => {
      this.audio = audio;
    });
    this.audioService.playlists$.subscribe((playlists) => {
      this.playlists = playlists;
      this.playlistsState = playlists.map((playlist, index) => index === 0);
    });
    this.audioStreamService.getState().subscribe((state) => {
      this.state = state;
    });
  }

  public play = (event: Event, audio: any) => {
    event.stopPropagation();
    this.audioStreamService.playStream(audio).subscribe((data) => {});
  };

  public playFromPlaylist = (
    event: Event,
    playlist: PlayList,
    trackNumber: number
  ) => {
    event.stopPropagation();
    this.audioStreamService
      .playFromPlaylist(playlist, trackNumber)
      .subscribe((data) => {});
  };

  public pause = (event: Event) => {
    event.stopPropagation();
    this.audioStreamService.pause();
  };

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.audioService.addAudioFile(file, this.fileName);
    }
  }

  addToEditor(event: Event, song: AudioFile): void {}
}
