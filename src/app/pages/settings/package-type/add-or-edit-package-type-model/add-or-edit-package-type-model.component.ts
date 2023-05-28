import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { ApiService } from '../../../../services/api.service'
import { NotifyService } from '../../../../services/notify.service'
import { enumData } from '../../../../core/enumData'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { CoreService } from '../../../../services/core.service'

declare var Object: any
@Component({
  selector: 'app-add-or-edit-package-type-model',
  templateUrl: './add-or-edit-package-type-model.component.html',
})
export class AddOrEditPackageTypeModelComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Thêm mới loại đóng gói'
  dataContType: any = []
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditPackageTypeModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.loadAllData()
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.modelTitle = 'Chỉnh sửa loại đóng gói'
      this.isEditItem = true
    } else {
      this.dataObject = new Object()
    }
  }

  clear() {
    this.dataObject = new Object()
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
    this.apiService.post(this.apiService.PACKAGE_TYPE.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.PACKAGE_TYPE.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  async loadAllData() {
    this.apiService.post(this.apiService.CONT_TYPE.FIND, { isDeleted: false }).then((res) => {
      if (res) {
        this.dataContType = res
      }
    })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
