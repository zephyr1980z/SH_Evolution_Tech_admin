import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-add-or-edit-salary-gas',
  templateUrl: './add-or-edit-salary-gas.component.html',
})
export class AddOrEditSalaryGasComponent implements OnInit {
  currentUser: User | undefined
  dataObject: any = {}
  isEditItem = false
  modelTitle = 'Thêm mới'
  loading = true
  enumData: any

  lstContType: any = []
  lstCodeContType: any = this.coreService.convertObjToArray(enumData.ContType)
  lstServiceType: any = []
  lstPickupTypeEnum: any = []
  lstPickupType: any = []

  lstProduct: any = []
  lstLocation: any = []
  lstArea: any = []

  constructor(
    private dialogRef: MatDialogRef<AddOrEditSalaryGasComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private notifyService: NotifyService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  async ngOnInit() {
    this.lstServiceType = this.coreService.convertObjToArray(enumData.ServiceType)
    this.lstPickupTypeEnum = this.coreService.convertObjToArray(enumData.PickupType)
    if (this.data && this.data !== null && this.data.add != true) {
      this.modelTitle = 'Cập nhật'
      this.dataObject = this.data
      this.isEditItem = true
      if (this.dataObject.serviceType == 'XuatKhau') {
        this.lstPickupType = this.coreService.convertObjToArray(this.lstPickupTypeEnum[0])
      } else if (this.dataObject.serviceType == 'NhapKhau') {
        this.lstPickupType = this.coreService.convertObjToArray(this.lstPickupTypeEnum[1])
      } else if (this.dataObject.serviceType == 'ChuyenKho') {
        this.lstPickupType = []
      }
    } else this.dataObject = new Object()

    await this.loadAllData()
  }

  async loadAllData() {
    Promise.all([
      this.apiService.post(this.apiService.PRODUCT.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.LOCATION.CUSTOM_FIND, { isDeleted: false, locationType: 'Port' }),
      this.apiService.post(this.apiService.CONT_TYPE.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.LOCATION.FIND_AREA, { isDeleted: false }),
    ]).then(async (res) => {
      if (res) {
        this.lstProduct = res[0]
        this.lstLocation = res[1]
        this.lstContType = res[2]
        this.lstArea = res[3]
      }
    })
  }

  onSave() {
    const data = this.dataObject
    // const contType = this.lstContType.find((e: any) => e.id == data.contTypeId)
    if (data.codeContType == this.enumData.ContType.Cont20.code) {
      if (parseInt(data.quantity) > 2 || parseInt(data.quantity) < 0) {
        this.notifyService.showError('Cont 20 chỉ có thể có số lượng cont là 1 hoặc 2!')
        return
      }
    }
    if (
      data.codeContType == this.enumData.ContType.Cont40.code ||
      data.codeContType.type == this.enumData.ContType.Cont45.code
    ) {
      if (parseInt(data.quantity) > 1) {
        this.notifyService.showError('Cont 40 hoặc 45 chỉ có thể có số lượng cont là 1!')
        return
      }
    }
    if (data.id && data.id !== '') {
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  addObject(data: any) {
    data.type = this.data.type
    this.notifyService.showloading()
    this.apiService.post(this.apiService.SALARY_GAS.CREATE, data).then((result) => {
      this.notifyService.hideloading()
      if (result) {
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog(1)
      }
    })
  }

  updateObject(data: any) {
    data.type = this.data.type
    this.notifyService.showloading()
    this.apiService.post(this.apiService.SALARY_GAS.UPDATE, data).then((result) => {
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

  onChangeServiceType(event: any) {
    delete this.dataObject.pickupType
    if (event == 'XuatKhau') {
      this.lstPickupType = this.coreService.convertObjToArray(this.lstPickupTypeEnum[0])
    } else if (event == 'NhapKhau') {
      this.lstPickupType = this.coreService.convertObjToArray(this.lstPickupTypeEnum[1])
    } else if (event == 'ChuyenKho') {
      this.lstPickupType = []
      this.dataObject.pickupType
    }
  }

  onChangeContType() {
    const contType = this.lstContType.find((e: any) => e.id == this.dataObject.contTypeId)
    if (contType.type == this.enumData.ContType.Cont40.code || contType.type == this.enumData.ContType.Cont45.code)
      this.dataObject.quantity = 1
    else delete this.dataObject.quantity
  }
}
