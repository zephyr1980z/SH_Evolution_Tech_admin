import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-add-or-edit-contract-price',
  templateUrl: './add-or-edit-contract-price.component.html',
})
export class AddOrEditContractPriceComponent implements OnInit {
  enumData: any
  dataObject: any
  isEditItem = false

  modelTitle = 'THÊM MỚI BẢNG GIÁ PHỤ LỤC'
  lstOfContType: any = []
  lstCusLocation: any = []

  lstFromArea: any = []
  lstOfFromCusLocation: any = []

  lstToArea: any = []
  lstOfToCusLocation: any = []

  dataSearch: any

  enumServiceType: any = {}

  constructor(
    private coreService: CoreService,
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddOrEditContractPriceComponent>,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public dataParent: any
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
    this.enumServiceType = this.enumData.ServiceType
  }

  async ngOnInit(): Promise<void> {
    console.log(this.dataParent)
    if (this.dataParent.id) {
      this.dataObject = this.dataParent
      this.isEditItem = true
      this.modelTitle = `CẬP NHẬT BẢNG GIÁ PHỤ LỤC ${
        this.enumServiceType[this.dataParent?.contractTerm?.serviceType]?.name
      }`
    } else {
      this.dataObject = this.dataParent || {}
      this.modelTitle = `${this.modelTitle} ${this.enumServiceType[this.dataParent?.contractTerm?.serviceType]?.name}`
    }
    this.dataSearch = new Object()
    /** Xét điều kiện của Dịch vụ vận chuyển Stock: Kho - Port: Cảng*/
    if (this.enumData.ServiceType.XuatKhau.code == this.dataParent?.contractTerm?.serviceType) {
      this.dataSearch.fromType = this.enumData.LocationType.Stock.code
      this.dataSearch.toType = this.enumData.LocationType.Port.code
    } else if (this.enumData.ServiceType.NhapKhau.code == this.dataParent?.contractTerm?.serviceType) {
      this.dataSearch.fromType = this.enumData.LocationType.Port.code
      this.dataSearch.toType = this.enumData.LocationType.Stock.code
    } else if (this.enumData.ServiceType.ChuyenKho.code == this.dataParent?.contractTerm?.serviceType) {
      this.dataSearch.fromType = this.enumData.LocationType.Stock.code
      this.dataSearch.toType = this.enumData.LocationType.Stock.code
    }
    await this.loadCusLocation()
    await this.loadAllData()
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER_CONTRACT_PRICE.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  addObject(data: any) {
    data.customerId = this.dataParent?.contractTerm?.customerId
    data.customerContractId = this.dataParent?.contractTerm?.customerContractId
    data.customerContractTermId = this.dataParent?.contractTerm?.customerContractTermId
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER_CONTRACT_PRICE.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  onSave() {
    const data = this.dataObject
    const fromLocation = this.lstOfFromCusLocation.find((e: any) => e.id == data.fromLocationId)
    if (fromLocation) {
      data.fromLocationName = fromLocation.name
      data.fromLocationAddress = fromLocation.address
    }
    const toLocation = this.lstOfToCusLocation.find((e: any) => e.id == data.toLocationId)
    if (toLocation) {
      data.toLocationName = toLocation.name
      data.toLocationAddress = toLocation.address
    }

    if (this.dataParent.transportType != 'LCL') {
      const contType = this.lstOfContType.find((e: any) => e.id == data.contTypeId)
      if (contType.type == this.enumData.ContType.Cont20.code) {
        if (parseInt(data.quantity) > 2 || parseInt(data.quantity) < 0) {
          this.notifyService.showError('Cont 20 chỉ có thể có số lượng cont là 1 hoặc 2!')
          return
        }
      }
      if (contType.type == this.enumData.ContType.Cont40.code || contType.type == this.enumData.ContType.Cont45.code)
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

  closeDialog() {
    this.dialogRef.close(1)
  }

  async loadCusLocation() {
    await Promise.all([
      this.apiService.post(this.apiService.ORDER.FIND_LOCATION, {
        isDeleted: false,
        customerId: this.dataParent?.contractTerm?.customerId,
      }),
      this.apiService.post(this.apiService.LOCATION.FIND_DATA_AREA, {
        isDeleted: false,
      }),
    ]).then(async (res) => {
      // FROM LOCATION
      this.lstOfFromCusLocation = res[0]
      // this.lstOfFromCusLocation = res[0].filter((e: any) => e.locationType == this.dataSearch.fromType)

      // GROUP FROM AREA
      // const mapFromCusArea: any = {}
      // for (const fromCusLocation of this.lstOfFromCusLocation) {
      //   const itemIndex = mapFromCusArea[fromCusLocation.areaId]
      //   if (itemIndex) {
      //     itemIndex.__locations__.push(mapFromCusArea)
      //   } else if (itemIndex?.__locations__) {
      //     mapFromCusArea[fromCusLocation.areaId] = { ...mapFromCusArea.__area__, __locations__: [mapFromCusArea] }
      //   }
      // }
      // this.lstFromArea = this.coreService.convertObjToArray(mapFromCusArea)
      this.lstFromArea = res[1]
      // TO LOCATION
      this.lstOfToCusLocation = res[0]
      // this.lstOfToCusLocation = res[0].filter((e: any) => e.locationType == this.dataSearch.toType)

      // GROUP TO AREA
      // const mapToCusArea: any = {}
      // for (const toCusLocation of this.lstOfToCusLocation) {
      //   const itemIndex = mapToCusArea[toCusLocation.areaId]
      //   if (itemIndex) {
      //     itemIndex.__locations__.push(mapToCusArea)
      //   } else if (itemIndex?.__locations__) {
      //     mapToCusArea[toCusLocation.areaId] = { ...mapToCusArea.__area__, __locations__: [mapToCusArea] }
      //   }
      // }
      // this.lstToArea = this.coreService.convertObjToArray(mapToCusArea)
      this.lstToArea = res[1]
    })
  }

  async loadAllData() {
    await Promise.all([
      this.apiService.post(this.apiService.CONT_TYPE.FIND, { where: { isDeleted: false } }),
      this.apiService.post(this.apiService.CUSTOMER_CONTRACT_PRICE.FIND_CUSTOMER_LOCATION, {
        where: { isDeleted: false, customerId: this.dataParent?.contractTerm?.customerId },
      }),
    ]).then(async (res) => {
      this.lstOfContType = res[0] || []
      this.lstCusLocation = res[1]
    })
  }

  onChangeContType() {
    const contType = this.lstOfContType.find((e: any) => e.id == this.dataObject.contTypeId)
    if (contType.type == this.enumData.ContType.Cont40.code || contType.type == this.enumData.ContType.Cont45.code)
      this.dataObject.quantity = 1
    else delete this.dataObject.quantity
  }

  // onChangeFromArea() {}

  checkLocationFrom(itemArea: any) {
    return !this.dataObject.fromLocationId
      ? true
      : itemArea.__locations__?.some((e: any) => (e.id = this.dataObject.fromLocationId))
  }

  isMatchAreaFrom(value: any): boolean {
    return !this.dataObject.fromAreaId ? true : value.areaId === this.dataObject.fromAreaId
  }

  isMatchAreaTo(value: any): boolean {
    return !this.dataObject.toAreaId ? true : value?.areaId === this.dataObject.toAreaId
  }

  // onChangeFromLocation() {}

  onChangeFromArea() {}
  onChangeToArea() {}

  // onChangeFromLocation() {}
}
