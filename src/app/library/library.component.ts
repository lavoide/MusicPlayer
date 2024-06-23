import {
  Component,
  ViewChild,
  AfterViewInit,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { AudioFile, AudioService, PlayList } from '../shared/audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
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
import {
  AudioStreamService,
} from '../shared/audio-stream.service';

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
  styleUrls: ['./library.component.scss'],
})
export class LibraryComponent implements OnInit, AfterViewInit {
  @ViewChild('songs') songsSelector!: MatSelectionList;
  private audioService = inject(AudioService);
  public audioStreamService = inject(AudioStreamService);
  public state = this.audioStreamService.getState();

  public fileName = '';
  public playlistName = '';
  public cutStart = 0;
  public cutEnd = 0;

  public audio = this.audioService.audio$;
  public playlists = this.audioService.playlists$;
  public audioContext = new AudioContext();
  public selectedSongs = signal<any[]>([]);
  public playlistsState = signal<boolean[]>([]);

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.playlistsState.set(this.playlists().map((_, index) => index === 0));
  }

  ngAfterViewInit() {
    this.songsSelector.selectionChange.subscribe(() => {
      this.selectedSongs.set(
        this.songsSelector.selectedOptions.selected.map(
          (option) => option.value
        )
      );
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.audioService.addAudioFile(file, this.fileName);
    }
  }

  addToPlaylist() {
    const dialogRef = this.dialog.open(AddToPlaylistComponent, {
      data: { playlists: this.playlists(), selected: undefined },
    });

    dialogRef.afterClosed().subscribe((result) => {
      const playlist: PlayList = result;
      this.audioService.addToPlaylist(playlist, this.selectedSongs());
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
        tracks: this.selectedSongs(),
      };
      this.audioService.addPlaylist(playlist);
    });
  }

  drop(event: CdkDragDrop<string[]>, index: number): void {
    moveItemInArray(
      this.playlists()[index].tracks,
      event.previousIndex,
      event.currentIndex
    );
    this.audioService.reorderPlaylist(this.playlists());
  }

  cut(event: Event, song: AudioFile): void {
    event.stopPropagation();
    this.cutStart = 0;
    this.cutEnd = 0;
    this.audioStreamService.loadForCut(song);
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
