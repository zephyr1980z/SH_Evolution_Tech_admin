import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { ApiService } from '../../../../../services/api.service'
import { NotifyService } from '../../../../../services/notify.service'
import { enumData } from '../../../../../core/enumData'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { CoreService } from '../../../../../services/core.service'

@Component({
  selector: 'app-add-or-item-model',
  templateUrl: './add-or-edit-item-model.component.html',
})
export class AddOrEditItemModelComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Chỉnh sửa chi tiết phụ tùng'
  // lstUnit: any = []
  lstItemGroup: any = []
  lstSpecification: any = []
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditItemModelComponent>,
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
    this.apiService.post(this.apiService.ITEM.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ITEM.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  async loadAllData() {
    this.notifyService.showloading()
    Promise.all([
      this.apiService.post(this.apiService.ITEM_GROUP.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.SPECIFICATION.FIND, { isDeleted: false }),
    ]).then((res) => {
      this.notifyService.hideloading()
      if (res) {
        this.lstItemGroup = res[0]
        this.lstSpecification = res[1]
      }
    })
  }

  async onChangeSpecification() {
    const spec = await this.lstSpecification.find((e: any) => e.id == this.dataObject.specificationId)
    if (spec) {
      this.dataObject.unitName = spec.unitName
      this.dataObject.unitToBaseUnitQuantity = spec.unitToBaseUnitQuantity
      this.dataObject.baseUnitName = spec.baseUnitName
    }
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
