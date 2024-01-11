import {Routes} from '@angular/router';
import {IllustratorComponent} from "./modules/illustrator/illustrator.component";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/illustrator'
  },
  {
    path: 'illustrator',
    component: IllustratorComponent
  }
];
