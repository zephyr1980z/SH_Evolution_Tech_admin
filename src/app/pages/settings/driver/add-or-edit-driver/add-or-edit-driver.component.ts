import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-add-or-edit-driver',
  templateUrl: './add-or-edit-driver.component.html',
})
export class AddOrEditDriverComponent implements OnInit {
  currentUser: User | any
  dataObject: any = {}
  dataRomooc: any[] = []
  dataVehicle: any[] = []
  isEditItem = false
  modelTitle = 'Thêm mới Tài xế'
  constructor(
    private dialogRef: MatDialogRef<AddOrEditDriverComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private notifyService: NotifyService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit(): void {
    this.loadDataFind()
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.modelTitle = 'Chỉnh sửa tài xế'
      this.isEditItem = true
    } else {
      this.dataObject = new Object()
    }
  }

  loadDataFind() {
    Promise.all([
      this.apiService.post(this.apiService.ROMOOC.FIND, { where: { isDeleted: false } }),
      this.apiService.post(this.apiService.VEHICLE.FIND, { where: { isDeleted: false } }),
    ]).then(async (res) => {
      this.dataRomooc = res[0] || []
      this.dataVehicle = res[1] || []
    })
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
    if (data.password !== data.confimPassword) {
      this.notifyService.showError('Mật khẩu không khớp!')
      return
    }
    this.notifyService.showloading()
    this.apiService.post(this.apiService.DRIVER.CREATE, data).then((result) => {
      this.notifyService.hideloading()
      if (result) {
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog(1)
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.DRIVER.UPDATE, data).then((result) => {
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
