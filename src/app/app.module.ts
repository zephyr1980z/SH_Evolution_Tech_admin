import { registerLocaleData } from '@angular/common'
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import vi from '@angular/common/locales/vi'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n'

import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzLayoutModule } from 'ng-zorro-antd/layout'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { NzNotificationModule } from 'ng-zorro-antd/notification'
import { BasicAuthInterceptor } from './_helpers/basic-auth.interceptor'
import { ErrorInterceptor } from './_helpers/error.interceptor'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { IconsProviderModule } from './icons-provider.module'
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component'

import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NZ_CONFIG } from 'ng-zorro-antd/core/config'
import { NzImageModule } from 'ng-zorro-antd/image'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { ApiService } from './services/api.service'
import { AuthenticationService } from './services/authentication.service'
import { CoreService } from './services/core.service'
import { NotifyService } from './services/notify.service'
import { StorageService } from './services/storage.service'

import { OverlayContainer } from '@angular/cdk/overlay'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { InAppRootOverlayContainer } from './in-app-root-overlay-container'
import { ToolsModule } from './pages/tools/tools.module'

registerLocaleData(vi)

@NgModule({
  declarations: [AppComponent, AdminLayoutComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzDropDownModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NzDropDownModule,
    NzNotificationModule,
    // SettingsModule,
    NzImageModule,
    NzBadgeModule,
    NzPopoverModule,
    NzListModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzModalModule,
    NzAlertModule,
    NzInputModule,
    NzFormModule,
    ToolsModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: vi_VN },
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: NZ_CONFIG, useValue: { notification: { nzMaxStack: 1, nzDuration: 2000 } } },
    { provide: OverlayContainer, useClass: InAppRootOverlayContainer },
    NotifyService,
    ApiService,
    AuthenticationService,
    CoreService,
    StorageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
