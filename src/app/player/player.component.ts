import { Component, inject } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import {
  AudioStreamService,
  StreamState,
} from '../shared/audio-stream.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    MatSliderModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  private audioStreamService = inject(AudioStreamService);

  public state: StreamState | undefined;
  public audioContext = new AudioContext();
  public progress: number = 0;

  ngOnInit() {
    this.audioStreamService.getState().subscribe((state) => {
      this.state = state;
      // console.log(state);
    });
  }

  public play = () => {
    this.audioStreamService.play();
  };

  public pause = () => {
    this.audioStreamService.pause();
  };

  public onSliderChangeEnd(change: any) {
    this.audioStreamService.seekTo(change.value);
  }

  public rewind = () => {
    this.audioStreamService.seekTo(0);
  };

  public loop = () => {
    this.audioStreamService.loop(!this.state?.isLooping);
  };

  public changeRate = (speed: any) => { 
    this.audioStreamService.changeRate(speed.value);
  };

  public changeVolume = (volume: any) => { 
    this.audioStreamService.changeVolume(volume.value);
  };
}
