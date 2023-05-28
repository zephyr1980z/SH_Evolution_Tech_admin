import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { ApiService } from '../../../../services/api.service'
import { NotifyService } from '../../../../services/notify.service'
import { enumData } from '../../../../core/enumData'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

declare var Object: any
@Component({
  selector: 'app-add-or-edit-group-product-model',
  templateUrl: './add-or-edit-group-product-model.component.html',
})
export class AddOrEditGroupProductModelComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Thêm mới nhóm hàng'
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddOrEditGroupProductModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.modelTitle = 'Chỉnh sửa nhóm hàng'
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
    this.apiService.post(this.apiService.GROUP_PRODUCT.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.GROUP_PRODUCT.UPDATE, data).then((result) => {
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
