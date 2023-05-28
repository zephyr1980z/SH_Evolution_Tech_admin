import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-add-or-edit-license-type',
  templateUrl: './add-or-edit-license-type.component.html',
})
export class AddOrEditLicenseTypeComponent implements OnInit {
  currentUser: User | any
  dataObject: any = {}
  isEditItem = false
  modelTitle = 'Thêm mới loại bằng lái'
  constructor(
    private dialogRef: MatDialogRef<AddOrEditLicenseTypeComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private notifyService: NotifyService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit(): void {
    if (this.data && this.data !== null) {
      this.modelTitle = 'Cập nhật loại bằng lái'
      this.dataObject = this.data
      this.isEditItem = true
    }
  }

  onSave() {
    const data = this.dataObject
    if (data.id && data.id !== '') {
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  addObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.LICENSE_TYPE.CREATE, data).then((result) => {
      this.notifyService.hideloading()
      if (result) {
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog(1)
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.LICENSE_TYPE.UPDATE, data).then((result) => {
      this.notifyService.hideloading()
      if (result) {
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog(1)
      }
    })
  }

  closeDialog(flag: any) {
    this.dialogRef.close(flag)
  }
}
