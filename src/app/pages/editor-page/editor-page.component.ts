import { Component } from '@angular/core';
import { TracklistComponent } from '../../tracklist/tracklist.component';
import { EditorComponent } from '../../editor/editor.component';

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [TracklistComponent, EditorComponent],
  templateUrl: './editor-page.component.html',
  styleUrl: './editor-page.component.scss',
})
export class EditorPageComponent {
}
