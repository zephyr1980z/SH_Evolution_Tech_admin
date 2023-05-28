import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../../core/enumData'
import { ApiService } from '../../../../../services/api.service'
import { AuthenticationService } from '../../../../../services/authentication.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'

@Component({
  selector: 'app-add-container-product',
  templateUrl: './add-container-product.component.html',
})
export class AddContainerProductComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Thêm Sản Phẩm Vào Container'
  lstOfCusLocationSrc: any = []
  lstOfCusLocation: any = []
  lstOfCusProductSrc: any = []
  lstOfCusProduct: any = []
  lstOfPackageType: any = []
  lstContProduct: any = []
  dataChooseProduct: any = {}
  enumData = enumData
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService,
    private dialogRef: MatDialogRef<AddContainerProductComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.loadCusProduct()
    this.loadCusLocation()
    // if (this.data && this.data !== null) {
    //   this.dataObject = this.data
    //   this.modelTitle = 'Thêm Sản Phẩm Vào Container'
    //   this.isEditItem = true
    // } else {
    this.dataObject = new Object()
    this.dataObject.lstContProduct = []
    // }
  }

  clear() {
    this.dataObject = new Object()
  }

  onSave() {
    this.data[0].lstContProduct = this.dataObject.lstContProduct
    this.closeDialog()
  }

  async loadCusLocation() {
    this.apiService
      .post(this.apiService.ORDER.FIND_CUSTOMER_LOCATION, {
        customerId: this.data[1],
        isDeleted: false,
      })
      .then(async (res) => {
        if (res) {
          this.lstOfCusLocationSrc = res
          this.lstOfCusLocation = res
        }
      })
  }

  async loadCusProduct() {
    await this.apiService
      .post(this.apiService.ORDER.FIND_CUSTOMER_PRODUCT, {
        customerId: this.data[1],
        isDeleted: false,
      })
      .then(async (res) => {
        if (res) {
          this.lstOfCusProductSrc = res
          this.lstOfCusProduct = res
        }
      })
  }

  onDeleteProduct(index: any) {
    this.dataObject.lstContProduct.splice(index, 1)
  }

  onAddProduct() {
    if (!this.dataChooseProduct.productId) delete this.dataChooseProduct.packageTypeId
    const product = this.lstOfCusProductSrc.find((e: any) => e.productId == this.dataChooseProduct.productId)
    if (product) {
      this.dataChooseProduct.packageTypeId = product.packageTypeId
    }
    this.dataObject.lstContProduct.push({
      productId: this.dataChooseProduct.productId,
      packageTypeId: this.dataChooseProduct.packageTypeId,

      /** Điểm lấy hàng */
      fromLocationId: this.dataChooseProduct.fromLocationId,
      fromLocationCode: this.dataChooseProduct.fromLocationCode,
      fromLocationName: this.dataChooseProduct.fromLocationName,
      fromLocationAddress: this.dataChooseProduct.fromLocationAddress,
      fromETD: this.dataChooseProduct.fromETD,

      /** Điểm giao hàng */
      toLocationId: this.dataChooseProduct.toLocationId,
      toLocationCode: this.dataChooseProduct.toLocationCode,
      toLocationName: this.dataChooseProduct.toLocationName,
      toLocationAddress: this.dataChooseProduct.toLocationAddress,
      toETD: this.dataChooseProduct.toETD,
    })
    this.dataChooseProduct = new Object()
  }

  onChangeFromLocationPro() {
    if (!this.dataChooseProduct.fromLocationId) {
      delete this.dataChooseProduct.fromLocationAddress
    }
    const fromLocation = this.lstOfCusLocation.find((e: any) => e.locationId == this.dataChooseProduct.fromLocationId)
    if (fromLocation) {
      this.dataChooseProduct.fromLocationAddress = fromLocation.address
      this.dataChooseProduct.fromLocationCode = fromLocation.code
      this.dataChooseProduct.fromLocationName = fromLocation.name
    }
    this.lstOfCusLocation = this.lstOfCusLocationSrc.filter(
      (e: any) =>
        e.locationId != this.dataChooseProduct.fromLocationId && e.locationId != this.dataChooseProduct.toLocationId
    )
  }

  onChangeToLocationPro() {
    if (!this.dataChooseProduct.toLocationId) {
      delete this.dataChooseProduct.toLocationAddress
    }
    const toLocation = this.lstOfCusLocation.find((e: any) => e.locationId == this.dataChooseProduct.toLocationId)
    if (toLocation) {
      this.dataChooseProduct.toLocationAddress = toLocation.address
      this.dataChooseProduct.toLocationCode = toLocation.code
      this.dataChooseProduct.toLocationName = toLocation.name
    }
    this.lstOfCusLocation = this.lstOfCusLocationSrc.filter(
      (e: any) =>
        e.locationId != this.dataChooseProduct.fromLocationId && e.locationId != this.dataChooseProduct.toLocationId
    )
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
