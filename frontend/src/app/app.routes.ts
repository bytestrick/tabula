import {Routes} from '@angular/router';
import {SignInComponent} from './auth/sign-in/sign-in.component';
import {SignUpComponent} from './auth/sign-up/sign-up.component';
import {AppComponent} from './app.component';
import {authGuard} from './auth/auth.guard';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {OtpComponent} from './auth/otp/otp.component';

export const routes: Routes = [
  {path: '', component: AppComponent, canActivate: [authGuard]},
  {path: 'sign-in', component: SignInComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'otp', component: OtpComponent},
  {path: '**', component: PageNotFoundComponent}
];
