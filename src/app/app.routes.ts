import { Routes } from '@angular/router';
import { EditorPageComponent } from './pages/editor-page/editor-page.component';
import { PlayerPageComponent } from './pages/player-page/player-page.component';

export const routes: Routes = [
    { path: 'player', component: PlayerPageComponent },
    { path: 'editor', component: EditorPageComponent },
    { path: '', redirectTo: '/editor', pathMatch: 'full' }
];
