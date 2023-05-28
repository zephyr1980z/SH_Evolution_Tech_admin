import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { enumData } from '../core/enumData'
import { User } from '../models/user.model'
import { ApiService } from '../services/api.service'
import { AuthenticationService } from '../services/authentication.service'
import { NotifyService } from '../services/notify.service'

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  currentUser: User | any
  constructor(
    private authenticationService: AuthenticationService,
    private notifyService: NotifyService,
    private apiService: ApiService
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: any) => {
        this.notifyService.hideloading()
        // if (err.status === 401) {
        //   // auto logout if 401 response returned from api

        //   //#region reset access token
        //   if (window.location.href.includes(enumData.FrontendTK) && this.currentUser?.accessToken) {
        //     this.apiService
        //       .post(this.apiService.TOKEN.RESET_TOKEN, { accessToken: this.currentUser.accessToken })
        //       .then((res) => {
        //         if (res) {
        //           const currentUser = this.authenticationService.currentUserValue
        //           if (currentUser && currentUser.accessToken) {
        //             currentUser.accessToken = res.accessToken
        //             this.currentUser.accessToken = res.accessToken
        //             return
        //           }
        //           location.reload()
        //         }
        //       })
        //   }
        //   //#endregion
        //   else {
        //     this.authenticationService.logout()
        //     if (err.url && err.url !== `${enumData.ApiUrl}/auth/login`) {
        //       // tslint:disable-next-line: deprecation
        //       location.reload()
        //     }
        //   }
        // }

        if (err.name == 'HttpErrorResponse' && err.statusText == 'Unknown Error') {
          err.statusText = 'Server đang update hoặc mất kết nối, vui lòng thử lại sau.'
        }

        const error = err.error.message || err.statusText
        if (!window.location.href.includes(enumData.FrontendTK)) this.notifyService.showErrorBE(error)
        else this.notifyService.showErrorBE(error)
        return throwError(error)
      })
    )
  }
}
