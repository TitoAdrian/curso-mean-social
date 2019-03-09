import { FollowedComponent } from './components/followed/followed.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UsersComponent } from './components/users/users.component';
import { TimeLineComponent } from './components/timeline/timeline.component';
import { FollowingComponent } from './components/following/following.component';

import { UserGuard } from './services/user.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'mis-datos', component: UserEditComponent, canActivate: [UserGuard] },
  { path: 'gente', component: UsersComponent, canActivate: [UserGuard] },
  { path: 'gente/:page', component: UsersComponent, canActivate: [UserGuard] },
  { path: 'timeline', component: TimeLineComponent, canActivate: [UserGuard] },
  { path: 'perfil/:id', component: ProfileComponent, canActivate: [UserGuard] },
  { path: 'siguiendo/:id/:page', component: FollowingComponent, canActivate: [UserGuard] },
  { path: 'seguidores/:id/:page', component: FollowedComponent, canActivate: [UserGuard] },
  //{ path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
