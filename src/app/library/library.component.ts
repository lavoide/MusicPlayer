import { Component, ViewChild, inject } from '@angular/core';
import { AudioFile, AudioService, PlayList } from '../shared/audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatSelectionList } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import {
  AudioStreamService,
  StreamState,
} from '../shared/audio-stream.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { AddToPlaylistComponent } from '../dialogs/add-to-playlist/add-to-playlist.component';
import { CreatePlaylistComponent } from '../dialogs/create-playlist/create-playlist.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatExpansionModule,
    CdkDropList,
    CdkDrag,
    MatDividerModule,
    MatMenuModule,
    MatSliderModule,
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent {
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

  ngAfterViewInit() {
    this.songsSelector.selectionChange.subscribe(() => {
      this.selectedSongs = this.songsSelector.selectedOptions.selected.map(
        (option) => option.value
      );
    });
  }

  public play = (event: Event, audio: any) => {
    event.stopPropagation();
    this.audioStreamService.playStream(audio).subscribe((data) => {
    });
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

  addToPlaylist() {
    const dialogRef = this.dialog.open(AddToPlaylistComponent, {
      data: { playlists: this.playlists, selected: undefined },
    });

    dialogRef.afterClosed().subscribe((result) => {
      const playlist: PlayList = result;
      this.audioService.addToPlaylist(playlist, this.selectedSongs);
    });
  }

  createPlaylist() {
    const dialogRef = this.dialog.open(CreatePlaylistComponent, {
      data: { name: '' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.playlistName = result;
      const playlist: PlayList = {
        name: this.playlistName,
        tracks: this.selectedSongs,
      };
      this.audioService.addPlaylist(playlist);
    });
  }

  drop(event: CdkDragDrop<string[]>, index: number): void {
    moveItemInArray(
      this.playlists[index].tracks,
      event.previousIndex,
      event.currentIndex
    );
    this.audioService.reorderPlaylist(this.playlists);
  }

  cut(event: Event, song: AudioFile): void {
    event.stopPropagation();
    this.cutStart = 0;
    this.cutEnd = 0;
    this.audioStreamService.loadForCut(song).subscribe((data) => {});
  }

  handleCutStart(event: any) {
    this.cutStart = event.value;
  }

  handleCutEnd(event: any) {
    this.cutEnd = event.value;
  }

  cutSong(song: AudioFile) {
    fetch(song.url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        let source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.start(
          this.audioContext.currentTime,
          this.cutStart,
          this.cutEnd - this.cutStart
        );
        source.connect(this.audioContext.destination);
      })
      .catch((e) => console.error(e));
  }
}
