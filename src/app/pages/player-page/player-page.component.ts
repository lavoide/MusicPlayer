import { Component } from '@angular/core';
import { LibraryComponent } from '../../library/library.component';
import { PlayerComponent } from '../../player/player.component';

@Component({
  selector: 'app-player-page',
  standalone: true,
  imports: [LibraryComponent, PlayerComponent],
  templateUrl: './player-page.component.html',
  styleUrl: './player-page.component.scss'
})
export class PlayerPageComponent {

}
