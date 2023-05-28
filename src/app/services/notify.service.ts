import { Component, Inject, Injectable } from '@angular/core'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { MatSnackBar, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar'
import * as $ from 'jquery'

@Injectable({ providedIn: 'root' })
export class NotifyService {
  constructor(private readonly notification: NzNotificationService, private readonly snackBar: MatSnackBar) {}

  showErrorBE(error: any) {
    let message = 'Đã có lỗi xảy ra'
    if (error.message) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    $('#mainLoading').removeClass('loading-service')
    // this.notification.warning('Lỗi', message)
    this.openSnackBar(message, '', 'error-snackbar')
  }
  showError(message: string) {
    $('#mainLoading').removeClass('loading-service')
    // this.notification.warning('Lỗi', message)
    this.openSnackBar(message, '', 'error-snackbar')
  }
  showInfo(message: string) {
    $('#mainLoading').removeClass('loading-service')
    // this.notification.info('Thông báo', message)
    this.openSnackBar(message, '', 'blue-snackbar')
  }
  showSuccess(message: string) {
    $('#mainLoading').removeClass('loading-service')
    // this.notification.success('Thông báo', message)
    this.openSnackBar(message, '', 'success-snackbar')
  }

  showloading() {
    $('#mainLoading').addClass('loading-service')
  }

  hideloading() {
    $('#mainLoading').removeClass('loading-service')
  }

  openSnackBar(message: string, action: string, className = '') {
    this.snackBar.openFromComponent(BasicSnackbarComponent, {
      data: message,
      duration: 2000,
      panelClass: [className],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    })
  }
}

@Component({ template: `Thông báo!<br /><span [innerHtml]="data"></span>` })
export class BasicSnackbarComponent {
  constructor(public sbRef: MatSnackBarRef<BasicSnackbarComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
