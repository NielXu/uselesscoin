import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomepageComponent } from './pages/hompage/homepage.component';
import { PeerComponent } from './pages/peer/peer.component';

const routes: Routes = [
  {
    path: 'peer',
    component: PeerComponent,
  },
  {
    path: '',
    component: HomepageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
