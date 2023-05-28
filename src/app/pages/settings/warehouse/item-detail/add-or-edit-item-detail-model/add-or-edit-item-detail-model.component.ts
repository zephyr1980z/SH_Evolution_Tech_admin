import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { ApiService } from '../../../../../services/api.service'
import { NotifyService } from '../../../../../services/notify.service'
import { enumData } from '../../../../../core/enumData'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { CoreService } from '../../../../../services/core.service'

@Component({
  selector: 'app-add-or-item-detail-model',
  templateUrl: './add-or-edit-item-detail-model.component.html',
})
export class AddOrEditItemDetailModelComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Chỉnh sửa chi tiết phụ tùng'
  lstItem: any = []
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditItemDetailModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.isEditItem = true
    } else {
      this.modelTitle = 'Thêm mới chi tiết phụ tùng'
      this.dataObject = new Object()
    }
    this.loadAllData()
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
    this.apiService.post(this.apiService.ITEM_DETAIL.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ITEM_DETAIL.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  async loadAllData() {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ITEM.FIND, { isDeleted: false }).then((res) => {
      this.notifyService.hideloading()
      if (res) {
        this.lstItem = res
      }
    })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
