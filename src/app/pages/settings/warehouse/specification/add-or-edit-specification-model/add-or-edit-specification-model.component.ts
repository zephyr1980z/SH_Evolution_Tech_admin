import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { ApiService } from '../../../../../services/api.service'
import { NotifyService } from '../../../../../services/notify.service'
import { enumData } from '../../../../../core/enumData'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { CoreService } from '../../../../../services/core.service'

@Component({
  selector: 'app-add-or-edit-specification-model',
  templateUrl: './add-or-edit-specification-model.component.html',
})
export class AddOrEditSpecificationModelComponent implements OnInit {
  dataObject: any
  modelTitle = 'Chỉnh sửa quy cách'
  isEditItem = false

  lstItem: any = []
  lstUnit: any = []
  lstUnitSrc: any = []
  lstBaseUnit: any = []
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditSpecificationModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.isEditItem = true
      this.loadAllDataWhenEdit()
    } else {
      this.modelTitle = 'Thêm mới quy cách'
      this.loadAllDataWhenAdd()
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
    this.apiService.post(this.apiService.SPECIFICATION.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.SPECIFICATION.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  /** Dữ liệu truyền vào là id của unit */
  async onChangeUnit(data: any) {
    this.lstBaseUnit = this.lstUnitSrc.filter((e: any) => e.id != data)
  }

  async onChangeBaseUnit(data: any) {
    this.lstUnit = this.lstUnitSrc.filter((e: any) => e.id != data)
  }

  closeDialog() {
    this.dialogRef.close(1)
  }

  async loadAllDataWhenAdd() {
    this.notifyService.showloading()
    Promise.all([this.apiService.post(this.apiService.UNIT.FIND, { isDeleted: false })]).then((res) => {
      this.notifyService.hideloading()
      if (res) {
        this.lstUnitSrc = res[0]
        this.lstUnit = res[0]
        this.lstBaseUnit = res[0]
      }
    })
  }

  async loadAllDataWhenEdit() {
    this.notifyService.showloading()
    Promise.all([
      this.apiService.post(this.apiService.ITEM.FIND_WITH_SPECIFICATION, { isDeleted: false }),
      this.apiService.post(this.apiService.UNIT.FIND, { isDeleted: false }),
    ]).then((res) => {
      this.notifyService.hideloading()
      if (res) {
        this.lstItem = res[0]
        this.lstUnitSrc = res[1]
        this.lstUnit = res[1]
        this.lstBaseUnit = res[1]
      }
    })
  }
}
