import { Component, inject, computed, signal } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AudioStreamService } from '../shared/audio-stream.service';

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
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {
  public audioStreamService = inject(AudioStreamService);

  public state = this.audioStreamService.getState();
  public playlist = this.audioStreamService.getPlaylist();

  public progress = computed(() => this.state().currentTime || 0);
  public duration = computed(() => this.state().duration || 0);
}
