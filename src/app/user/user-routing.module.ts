import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { LoginAutoComponent } from './login-auto/login-auto.component'
import { LoginComponent } from './login/login.component'

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login-auto/:username/:password', component: LoginAutoComponent },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
