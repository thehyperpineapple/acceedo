import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent} from './user/user.component';
import { SettingComponent } from './setting/setting.component';
import { ReportComponent } from './report/report.component';
import { GraphComponent } from './graph/graph.component';



const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },  // Redirect to sign-in by default
  { path: 'sign-in', component: SignInComponent },          // Sign-in route
  { path: 'dashboard', component: DashboardComponent },     // Dashboard route               // User route
  { path: 'user', component : UserComponent},
  {path: 'setting', component : SettingComponent},
  {path: 'report', component: ReportComponent},
  {path: 'graph', component:GraphComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
