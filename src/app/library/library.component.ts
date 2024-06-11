import { Component, inject } from '@angular/core';
import { AudioService } from '../shared/audio.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AudioStreamService, StreamState } from '../shared/audio-stream.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent {
  private audioService = inject(AudioService);
  private audioStreamService = inject(AudioStreamService);
  public state: StreamState | undefined;

  public fileName = '';

  public audio = [] as any;
  public audioContext = new AudioContext();

  public play = (audio: any) => {
    this.audioStreamService.playStream(audio.url).subscribe(data => {
      // console.log(data);
    })
  };

  public pause = () => {
    this.audioStreamService.pause();
  };

  ngOnInit() {
    this.audioService.audio$.subscribe((audio) => {
      this.audio = audio;
    });
    this.audioStreamService.getState()
    .subscribe(state => {
      this.state = state;
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;

      console.log(file);
      this.audioService.addAudioFile(file, this.fileName);
    }
  }
}
