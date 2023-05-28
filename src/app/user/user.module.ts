import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { UserRoutingModule } from './user-routing.module'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzStatisticModule } from 'ng-zorro-antd/statistic'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { LoginComponent } from './login/login.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NzNotificationModule } from 'ng-zorro-antd/notification'
import { LoginAutoComponent } from './login-auto/login-auto.component'
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    NzButtonModule,
    NzStatisticModule,
    NzGridModule,
    NzCardModule,
    NzIconModule,
    NzNotificationModule,
  ],
  declarations: [LoginComponent, LoginAutoComponent],
  exports: [],
  bootstrap: [],
})
export class UserModule {}
