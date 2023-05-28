import { Component, OnInit, Inject, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { ApiService } from '../../../../services/api.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-change-password-employee-model',
  templateUrl: './change-password-employee-model.component.html',
})
export class ChangePasswordEmployeeModelComponent implements OnInit {
  dataObject: any
  constructor(
    private dialogRef: MatDialogRef<ChangePasswordEmployeeModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private notifyService: NotifyService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    if (this.data && this.data !== null) {
      this.dataObject = this.data
    }
  }

  onSave() {
    const data = this.dataObject
    if (data.newPassword !== data.confirmNewPassword) {
      this.notifyService.showError('Mật khẩu không khớp!')
      return
    }
    this.notifyService.showloading()
    this.apiService
      .post(this.apiService.EMPLOYEE.UPDATE_PASSWORD, {
        id: data.id,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      })
      .then((result) => {
        if (result) {
          this.notifyService.hideloading()
          this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
          this.closeDialog()
        }
      })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
