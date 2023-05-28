import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { environment } from '../../../../../../environments/environment'
import { enumData } from '../../../../../core/enumData'
import { ApiService } from '../../../../../services/api.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'

@Component({
  selector: 'app-add-or-edit-oil-monitoring-model',
  templateUrl: './add-or-edit-oil-monitoring-model.component.html',
  styleUrls: ['./add-or-edit-oil-monitoring-model.component.scss'],
})
export class AddOrEditOilMonitoringModelComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Thêm mới theo dõi đổ dầu'
  lstCodeRepair: any = []
  lstRepairType: any = []
  lstDriver: any = []
  lstVehicle: any = []
  uploadUrl = enumData.UploadUrl

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditOilMonitoringModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.loadAllDataSelect()
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.modelTitle = 'Chỉnh sửa theo dõi đổ dầu'
      this.isEditItem = true
    } else {
      this.dataObject = new Object()
    }
  }

  clear() {
    this.dataObject = new Object()
  }

  loadAllDataSelect() {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.VEHICLE.FIND, { isDeleted: false }).then(async (res) => {
      this.notifyService.hideloading()
      this.lstVehicle = res
    })
    this.notifyService.hideloading()
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
    this.apiService.post(this.apiService.OIL_MONITORING.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.OIL_MONITORING.UPDATE, data).then((result) => {
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

  handleClearImage(colName: string) {
    let file: any = document.querySelector(`.${colName}`)
    file.value = null
    this.dataObject[colName] = null
  }

  handleFileInput(obj: any, colName: string) {
    const fileToUpload = obj.files[0]
    if (fileToUpload && fileToUpload.size > enumData.maxSizeUpload * 1024 * 1024) {
      this.notifyService.showError(
        `Kích thước tối đa để upload là ${enumData.maxSizeUpload}MB, vui lòng chọn file khác`
      )
      return
    }
    if (fileToUpload) {
      this.notifyService.showloading()
      const formData: FormData = new FormData()
      formData.append('file', fileToUpload, fileToUpload.name)
      this.apiService.post(this.apiService.UPLOAD_FILE.UPLOAD_SINGLE, formData).then((res) => {
        this.notifyService.hideloading()
        if (res && res.length) {
          this.dataObject[colName] = res[0]
        }
      })
    }
  }
}
