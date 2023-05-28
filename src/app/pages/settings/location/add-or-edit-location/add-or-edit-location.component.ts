import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { ApiService } from '../../../../services/api.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-add-or-edit-location',
  templateUrl: './add-or-edit-location.component.html',
})
export class AddOrEditLocationComponent implements OnInit {
  dataObject: any = {}
  isEditItem = false
  modelTitle = 'Thêm mới địa điểm'
  dataLocationType: any[] = []
  dataCity: any[] = []
  dataDistrict: any[] = []
  dataWard: any[] = []
  isLoadingDistrict = false
  isLoadingWard = false
  isLoading = false
  dataPortArea: any[] = []

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddOrEditLocationComponent>,
    private coreService: CoreService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    Promise.all([
      await this.apiService.post(this.apiService.CITY.FIND, {}),
      await this.apiService.post(this.apiService.LOCATION.FIND_AREA, {}),
    ]).then((res) => {
      this.notifyService.hideloading()
      this.dataCity = res[0] || []
      this.dataPortArea = res[1] || []
    })

    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.isEditItem = true
      this.modelTitle = 'Cập nhật địa điểm'
      if (this.data.cityId) {
        this.apiService.post(this.apiService.DISTRICT.FIND, { cityId: this.dataObject.cityId }).then((res) => {
          if (res) {
            this.dataDistrict = res || []
          }
        })
      }

      if (this.data.districtId) {
        this.apiService.post(this.apiService.WARD.FIND, { districtId: this.dataObject.districtId }).then((res) => {
          if (res) {
            this.dataWard = res || []
          }
        })
      }
    }

    this.dataLocationType = this.coreService.convertObjToArray(enumData.LocationType)
  }

  clear() {
    this.dataObject = new Object()
  }

  onSave() {
    // if (this.dataObject.type === 'Port' ||  this.dataObject.areaId === '') {
    //   this.notifyService.showError('Cảng chưa thiết lập loại cảng, Vui lòng chọn loại cảng !')
    //   return
    // }
    const data = this.dataObject
    data.isDeleted = false
    if (data.id && data.id !== '') {
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  addObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.LOCATION.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.LOCATION.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  handleCitySearch() {
    this.isLoadingDistrict = true
    this.dataObject.districtId = null
    this.dataObject.wardId = null
    this.dataDistrict = []
    this.dataWard = []
    const where: any = {}
    if (this.dataObject.cityId) where['cityId'] = this.dataObject.cityId

    {
      this.apiService.post(this.apiService.DISTRICT.FIND, where).then((res) => {
        if (res) {
          this.dataDistrict = res || []
        }
        this.isLoadingDistrict = false
      })
    }
  }

  handleDistrictSearch() {
    this.isLoadingWard = true
    this.dataObject.wardId = null
    this.dataWard = []
    const where: any = {}
    if (this.dataObject.districtId) where['districtId'] = this.dataObject.districtId

    {
      this.apiService.post(this.apiService.WARD.FIND, where).then((res) => {
        if (res) {
          this.dataWard = res || []
        }
        this.isLoadingWard = false
      })
    }
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
