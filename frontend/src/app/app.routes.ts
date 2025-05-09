import {Routes} from '@angular/router';
import {SignInComponent} from './auth/sign-in/sign-in.component';
import {SignUpComponent} from './auth/sign-up/sign-up.component';
import {authGuard} from './auth/auth.guard';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {OtpComponent} from './auth/otp/otp.component';
import {HomeComponent} from './home/home.component';
import {tableOwnerGuard} from './guards/table-owner.guard';
import {TablePageComponent} from './table-page/table-page.component';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent, canActivate: [authGuard]},
  {path: 'tables/:table-id', component: TablePageComponent, canActivate: [authGuard, tableOwnerGuard]},
  {path: 'sign-in', component: SignInComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'otp', component: OtpComponent},
  {path: '**', component: PageNotFoundComponent}
];
