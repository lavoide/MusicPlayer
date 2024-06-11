import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LibraryComponent } from './library/library.component';
import { PlayerComponent } from './player/player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LibraryComponent, PlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'amazing-audio-player';
}
