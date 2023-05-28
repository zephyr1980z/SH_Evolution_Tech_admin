import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { ApiService } from '../../../../services/api.service'
import { NotifyService } from '../../../../services/notify.service'
import { enumData } from '../../../../core/enumData'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

declare var Object: any
@Component({
  selector: 'app-add-or-edit-product-model',
  templateUrl: './add-or-edit-product-model.component.html',
})
export class AddOrEditProductModelComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Thêm mới hàng hoá'
  lstOfPackageType: any = []
  lstOfGroupProduct: any = []
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddOrEditProductModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.loadAllData()
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.modelTitle = 'Chỉnh sửa hàng hoá'
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
    this.apiService.post(this.apiService.PRODUCT.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.PRODUCT.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  async loadAllData() {
    Promise.all([
      this.apiService.post(this.apiService.GROUP_PRODUCT.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.PACKAGE_TYPE.FIND, { isDeleted: false }),
    ]).then(async (res) => {
      if (res) {
        this.lstOfGroupProduct = res[0] || []
        this.lstOfPackageType = res[1] || []
      }
    })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
