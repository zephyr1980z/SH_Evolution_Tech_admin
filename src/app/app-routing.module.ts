import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AuthGuard } from './_helpers/auth.guard'
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component'

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: AdminLayoutComponent,
    children: [
      {
        path: 'welcome',
        loadChildren: () => import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
      },
      // {
      //   path: 'settings',
      //   loadChildren: () => import('./pages/settings/settings.module').then((m) => m.SettingsModule),
      // },
      {
        path: 'tools',
        loadChildren: () => import('./pages/tools/tools.module').then((m) => m.ToolsModule),
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
