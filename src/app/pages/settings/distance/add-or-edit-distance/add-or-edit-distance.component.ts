import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { ApiService } from '../../../../services/api.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-add-or-edit-distance',
  templateUrl: './add-or-edit-distance.component.html',
})
export class AddOrEditDistanceComponent implements OnInit {
  enumData: any
  dataObject: any
  isEditItem = false
  modelTitle = 'THÊM MỚI CỰ LY'

  lstLocation: any[] = []
  // lstLocationSrc: any[] = []

  lstArea: any[] = []
  dataToLocationType: any[] = []
  dataFromLocationType: any[] = []
  LocationType = this.coreService.convertObjToArray(enumData.LocationType)

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditDistanceComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadDataSearch()
    this.dataFromLocationType = this.coreService.convertObjToArray(enumData.LocationType)
    this.dataToLocationType = this.coreService.convertObjToArray(enumData.LocationType)
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.isEditItem = true
      this.modelTitle = 'CẬP NHẬT CỰ LY'
    } else {
      this.dataObject = new Object()
    }
  }

  loadDataSearch() {
    Promise.all([
      this.apiService.post(this.apiService.LOCATION.FIND, { where: { isDeleted: false } }),
      this.apiService.post(this.apiService.LOCATION.FIND_AREA, { where: { isDeleted: false } }),
    ]).then(async (res) => {
      this.lstLocation = res[0]
      // this.lstLocationSrc = res[0]
      this.lstArea = res[1]
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

  updateObject(data: any) {
    this.notifyService.showloading()
    this.dataObject.distance = Number(this.dataObject.distance)
    this.apiService.post(this.apiService.DISTANCE.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  addObject(data: any) {
    this.notifyService.showloading()
    this.dataObject.distance = Number(this.dataObject.distance)
    this.apiService.post(this.apiService.DISTANCE.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }

  // onChangeFromLocation(event: any) {
  //   this.dataFromLocationType = this.lstLocation.filter((e: any) => e.type == event)
  // }

  // onChangeToLocation(x: any) {
  //   this.dataToLocationType = this.lstLocationSrc.filter((s: any) => s.type == x)
  // }
}
