import { Component, OnInit, Optional, Inject } from '@angular/core'
import { ApiService } from '../../../../services/api.service'
import { NotifyService } from '../../../../services/notify.service'
import { enumData } from '../../../../core/enumData'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { CoreService } from '../../../../services/core.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { AddContainerProductComponent } from './add-container-product/add-container-product.component'
import { NzUploadFile } from 'ng-zorro-antd/upload'
import { environment } from '../../../../../environments/environment'

declare var Object: any
const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
@Component({
  selector: 'app-add-or-edit-order-model',
  templateUrl: './add-or-edit-order-model.component.html',
})
export class AddOrEditOrderModelComponent implements OnInit {
  dataObject: any = {}
  isEditItem = false
  modelTitle = 'Thêm mới Order'
  lstOfCustomer: any = []
  lstOfCusContract: any = []
  lstOfCusContractTermSrc: any = []
  lstOfCusContractTerm: any = []
  lstOfServiceType: any = []
  lstTransportType: any = []
  listOfSelectedValue: any = []
  lstOfContType: any = []
  lstOfCusLocationSrc: any = []
  lstOfCusLocation: any = []
  lstOfCusTakeProductLocationSrc: any = []
  lstOfCusTakeContLocation: any = []
  lstOfCusReuturnContLocation: any = []
  lstOfCusTakeProductLocation: any = []
  lstOfCusDeliveryLocationSrc: any = []
  lstOfCusDeliveryLocation: any = []
  lstOfCusProductSrc: any = []
  lstOfCusProduct: any = []
  lstOfPackageType: any = []
  lstContProduct: any = []
  lstProduct: any = []
  lstOrder: any = []
  lstEmployee: any = []
  lstLocationStock: any = []
  dataChoose: any = {}
  dataChooseProduct: any = {}
  enumData = enumData
  cont: any
  isShowListContProduct = false
  // orderContId: any
  listContTypeModalTitle = 'Thêm sảm phẩm vào container'
  // IMAGE
  urlAction = ''
  previewVisible = false
  previewImage: string = ''
  fileList: NzUploadFile[] = []
  lstShip: any = []

  currentUser: any

  // dateFmt = 'hh:mm dd/MM/yyyy'
  dateFmt = 'HH:mm dd/MM'
  timeFmtObj = { nzFormat: 'HH:mm' }
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private dialogRef: MatDialogRef<AddOrEditOrderModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.dialogRef.disableClose = true
    this.dialogRef.backdropClick().subscribe((_) => {
      let cn = confirm('Bạn có chắc chắn đóng cửa sổ ?')
      if (cn) {
        this.dialogRef.close()
      }
    })

    this.currentUser = this.coreService.currentUser

    await this.loadAllData()
    await this.loadLstShip()
    if (this.data) {
      this.isEditItem = true
      this.dataObject = this.data
      this.modelTitle = 'Chỉnh sửa Order'
      this.dataObject.lstContProductSrc = this.dataObject.lstContProduct

      await this.apiService
        .post(this.apiService.CONTRACT.FIND_WITH_CONDITIONS, {
          customerId: this.dataObject.customerId,
          isDeleted: false,
          order: { createdAt: 'DESC' },
        })
        .then(async (res) => {
          if (res) {
            this.lstOfCusContract = res
            await this.loadCusProduct()
            await this.loadPackageType()
            await this.loadCusLocation()
          }
        })

      await this.apiService
        .post(this.apiService.CUSTOMER_CONTRACT_TERM.FIND_WITH_CONDITIONS, {
          customerContractId: this.dataObject.customerContractId,
          serviceType: this.dataObject.serviceType,
          isDeleted: false,
        })
        .then(async (res) => {
          if (res) {
            this.lstOfCusContractTerm = res
            this.lstOfCusContractTermSrc = res
            this.lstOfCusContractTerm = await this.lstOfCusContractTermSrc.filter(
              (s: any) =>
                s.transportType == this.dataObject.transportType && s.serviceType == this.dataObject.serviceType
            )
          }
        })
    } else {
      this.dataObject = new Object()
      this.dataObject.lstOrderCont = []
      this.dataObject.lstProduct = []
      this.dataObject.fileList = []
    }

    // console.log(this.coreService.currentUser)
    // console.log(this.currentUser?.type)
    // console.log(this.enumData.UserType.Admin.name)
    this.dataObject.createdBy = this.dataObject?.createdBy || this.currentUser?.infor?.userId
    // console.log(this.currentUser)
    // infor.userId
    this.urlAction = environment.apiUrl + '/' + 'uploadFiles/upload_single'
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
    this.apiService.post(this.apiService.ORDER.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ORDER.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  async loadAllData() {
    this.notifyService.showloading()
    this.lstOfServiceType = this.coreService.convertObjToArray(enumData.ServiceType)
    this.lstTransportType = this.coreService.convertObjToArray(enumData.TransportType)
    Promise.all([
      this.apiService.post(this.apiService.CUSTOMER.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.CONT_TYPE.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.ORDER.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.EMPLOYEE.FIND, {
        isDeleted: false,
        // employeeType: 'TMS',
        departmentCodeIn: ['PKD', 'IT'],
      }),
      this.apiService.post(this.apiService.LOCATION.FIND, { isDeleted: false, type: enumData.LocationType.Stock.code }),
    ]).then(async (res) => {
      if (res) {
        this.lstOfCustomer = res[0]
        this.lstOfContType = res[1]
        this.lstOrder = res[2]
        this.lstEmployee = res[3]
        this.lstLocationStock = res[4]
      }
      this.notifyService.hideloading()
    })
  }

  async onChangeCustomer() {
    delete this.dataObject.customerContractId
    delete this.dataObject.serviceType
    delete this.dataObject.transportType
    delete this.dataObject.productId

    this.dataObject.invoiceCompanyId = this.dataObject.customerId
    this.dataObject.companyReimbursementId = this.dataObject.customerId
    this.dataObject.freightCompanyId = this.dataObject.customerId

    this.onChangeInvoiceCompany()
    this.onChangeFreightCompany()

    this.dataObject.fileList = []
    this.dataChoose = new Object()
    this.notifyService.showloading()
    this.apiService
      .post(this.apiService.CONTRACT.FIND_WITH_CONDITIONS, { customerId: this.dataObject.customerId, isDeleted: false })
      .then(async (res) => {
        this.notifyService.hideloading()
        if (res) {
          this.lstOfCusContract = res
          this.dataObject.customerContractId = res[0]?.id
          if (this.dataObject.customerContractId) await this.onChangeCustomerContract()
          if (this.dataObject.customerContractId) await this.onChangeCustomerContract()
          await this.loadCusLocation()
          await this.loadCusProduct()
          await this.loadPackageType()
        }
      })
  }

  onChangeInvoiceCompany() {
    this.dataObject.companyReimbursementId = this.dataObject.invoiceCompanyId
    const company = this.lstOfCustomer.find((e: any) => e.id == this.dataObject.invoiceCompanyId)
    if (company) {
      this.dataObject.invoiceCompanyTaxNumber = company.taxNumber
      this.dataObject.invoiceCompanyAddress = company.address
    }
  }

  onChangeReimbursementCompany() {
    // const company = this.lstOfCustomer.find((e: any) => e.id == data)
    // if (company) {
    //   this.dataObject.invoiceCompanyTaxNumber = company.taxNumber
    //   this.dataObject.invoiceCompanyAddress = company.address
    // }
  }

  onInvoiceCompany() {
    const company = this.lstOfCustomer.find((e: any) => e.id == this.dataObject.invoiceCompanyId)
    if (company) {
      this.dataObject.invoiceCompanyTaxNumber = company.taxNumber
      this.dataObject.invoiceCompanyAddress = company.address
    }
  }

  onChangeFreightCompany() {
    const company = this.lstOfCustomer.find((e: any) => e.id == this.dataObject.freightCompanyId)
    if (company) {
      this.dataObject.freightCompanyTaxNumber = company.taxNumber
      this.dataObject.freightCompanyAddress = company.address
    }
  }
  async onChangeCustomerContract() {
    delete this.dataObject.serviceType
    delete this.dataObject.transportType
    delete this.dataObject.productId
    this.dataChoose = new Object()
  }

  async loadCusContractTerm() {
    this.notifyService.showloading()
    this.apiService
      .post(this.apiService.CUSTOMER_CONTRACT_TERM.FIND_WITH_CONDITIONS, {
        customerContractId: this.dataObject.customerContractId,
        serviceType: this.dataObject.serviceType,
        isDeleted: false,
      })
      .then(async (res) => {
        if (res) {
          this.lstOfCusContractTerm = res
          this.lstOfCusContractTermSrc = res
          this.notifyService.hideloading()
        }
      })
  }

  async loadCusLocation() {
    // // customerContractTermId
    // if (this.dataChoose.customerContractTermId) {
    //   await this.apiService
    //     .post(this.apiService.LOCATION.FIND, {
    //       isDeleted: false,
    //       customerContractTermId: this.dataChoose.customerContractTermId,
    //     })
    //     .then(async (res) => {
    //       if (res) {
    //         this.lstOfCusLocationSrc = res
    //         this.lstOfCusLocation = res
    //       }
    //     })

    //   // FILTER LOCATION THEO SERVICE

    //   // LocationType
    //   // Depot
    //   // Parking
    //   // Stock
    //   // Port
    //   // Hub
    //   // Other

    //   const codeStock = enumData.LocationType.Stock.code
    //   const codePort = enumData.LocationType.Port.code
    //   // Chuyen kho
    //   if (this.dataObject.serviceType == enumData.ServiceType.ChuyenKho.code) {
    //     this.lstOfCusTakeProductLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type == codeStock)
    //     this.lstOfCusDeliveryLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codeStock)
    //     // Nhap khau
    //   } else if (this.dataObject.serviceType == enumData.ServiceType.NhapKhau.code) {
    //     this.lstOfCusTakeProductLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codePort)
    //     this.lstOfCusDeliveryLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codeStock)
    //   } else if (this.dataObject.serviceType == enumData.ServiceType.XuatKhau.code) {
    //     // Xuat khau
    //     this.lstOfCusTakeProductLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codeStock)
    //     this.lstOfCusDeliveryLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codePort)
    //   }
    //   this.lstOfCusTakeProductLocation = this.lstOfCusTakeProductLocationSrc
    //   this.lstOfCusDeliveryLocation = this.lstOfCusDeliveryLocationSrc
    // }
    if (this.dataChoose.customerContractTermId) {
      await Promise.all([
        this.apiService.post(this.apiService.LOCATION.FIND, {
          isDeleted: false,
          customerContractTermId: this.dataChoose.customerContractTermId,
        }),
        this.apiService.post(this.apiService.LOCATION.FIND, {
          isDeleted: false,
          // customerContractTermId: this.dataChoose.customerContractTermId,
        }),
      ]).then(async (res) => {
        this.notifyService.hideloading()

        this.lstOfCusLocationSrc = res[0]
        this.lstOfCusLocation = res[0]

        this.lstOfCusTakeContLocation = res[1]
        this.lstOfCusReuturnContLocation = res[1]
      })

      const codeStock = enumData.LocationType.Stock.code
      const codePort = enumData.LocationType.Port.code
      // Chuyen kho Kho -> Kho
      if (this.dataObject.serviceType == enumData.ServiceType.ChuyenKho.code) {
        this.lstOfCusTakeProductLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type == codeStock)
        this.lstOfCusDeliveryLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codeStock)
        // Nhap khau Cảng -> Kho
      } else if (this.dataObject.serviceType == enumData.ServiceType.NhapKhau.code) {
        this.lstOfCusTakeProductLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codePort)
        this.lstOfCusDeliveryLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codeStock)
      } else if (this.dataObject.serviceType == enumData.ServiceType.XuatKhau.code) {
        // Xuat khau Kho -> Cảng
        this.lstOfCusTakeProductLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codeStock)
        this.lstOfCusDeliveryLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.type === codePort)
      }
      this.lstOfCusTakeProductLocation = this.lstOfCusTakeProductLocationSrc
      this.lstOfCusDeliveryLocation = this.lstOfCusDeliveryLocationSrc
    }
  }

  async loadCusProduct() {
    await this.apiService
      .post(this.apiService.ORDER.FIND_CUSTOMER_PRODUCT, {
        customerId: this.dataObject.customerId,
        isDeleted: false,
      })
      .then(async (res) => {
        if (res) {
          this.lstOfCusProductSrc = res
          this.lstOfCusProduct = res
        }
      })
  }

  async loadLstShip() {
    await this.apiService
      .post(this.apiService.SHIP.FIND, {
        isDeleted: false,
      })
      .then(async (res) => {
        if (res) {
          this.lstShip = res
        }
      })
  }

  async loadPackageType() {
    this.apiService
      .post(this.apiService.PACKAGE_TYPE.FIND, {
        isDeleted: false,
      })
      .then(async (res) => {
        if (res) this.lstOfPackageType = res
      })
  }

  async onChangeServiceType(data: any) {
    delete this.dataObject.transportType
    delete this.dataObject.productId
    this.dataChoose = new Object()
    await this.loadCusContractTerm()
    if (data == enumData.ServiceType.ChuyenKho.code) {
      this.lstOfCusTakeProductLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.locationType == 'Stock')
      this.lstOfCusDeliveryLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.locationType == 'Stock')
    } else if (data == enumData.ServiceType.NhapKhau.code) {
      this.lstOfCusTakeProductLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.locationType == 'Port')
      this.lstOfCusDeliveryLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.locationType == 'Stock')
    } else if (data == enumData.ServiceType.XuatKhau.code) {
      this.lstOfCusTakeProductLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.locationType == 'Stock')
      this.lstOfCusDeliveryLocationSrc = this.lstOfCusLocationSrc.filter((e: any) => e.locationType == 'Port')
    }
    this.lstOfCusTakeProductLocation = this.lstOfCusTakeProductLocationSrc
    this.lstOfCusDeliveryLocation = this.lstOfCusDeliveryLocationSrc
  }

  onDelete(index: any) {
    this.dataObject.lstOrderCont.splice(index, 1)
  }

  onDeleteProduct(index: any) {
    this.dataObject.lstProduct.splice(index, 1)
  }

  onDeletelstContProductTable(index: any) {
    this.lstContProduct.splice(index, 1)
  }

  async onAddCont() {
    /** Điều kiện của thời gian lấy hàng */
    if (this.dataChoose.fromETD < this.dataChoose.emptyPickupTime) {
      this.notifyService.showError('Thời gian DỰ KIẾN LẤY HÀNG không được bé hơn thời gian LẤY CONTAINER RỖNG!')
      return
    } else if (this.dataChoose.toETD < this.dataChoose.emptyPickupTime) {
      /** Điều kiện của thời gian giao hàng */
      this.notifyService.showError('Thời gian DỰ KIẾN GIAO HÀNG không được bé hơn thời gian LẤY CONTAINER RỖNG!')
      return
    } else if (this.dataChoose.toETD < this.dataChoose.fromETD) {
      this.notifyService.showError('Thời gian DỰ KIẾN GIAO HÀNG không được bé hơn thời gian DỰ KIẾN LẤY HÀNG!')
      return
    } else if (this.dataChoose.emptyReturnTime < this.dataChoose.emptyPickupTime) {
      /** Điều kiện của thời gian trả công rỗng */
      this.notifyService.showError('Thời gian TRẢ CONTAINER RỖNG không được bé hơn thời gian LẤY CONTAINER RỖNG!')
      return
    } else if (this.dataChoose.emptyReturnTime < this.dataChoose.fromETD) {
      this.notifyService.showError('Thời gian TRẢ CONTAINER RỖNG không được bé hơn thời gian DỰ KIẾN LẤY HÀNG!')
      return
    } else if (this.dataChoose.emptyReturnTime < this.dataChoose.toETD) {
      this.notifyService.showError('Thời gian TRẢ CONTAINER RỖNG không được bé hơn thời gian DỰ KIẾN GIAO HÀNG!')
      return
    }

    this.dataChoose.lstContProduct = []
    await this.onAddProduct()

    this.dataObject.lstOrderCont.push({
      orderPairedId: this.dataChoose.orderPairedId,
      pairingLocationId: this.dataChoose.pairingLocationId,
      contTypeId: this.dataChoose.contTypeId,
      quantity: this.dataChoose?.quantity,
      weight: this.dataChoose?.weight,
      customerContractTermId: this.dataChoose.customerContractTermId,
      lstContProduct: this.dataChoose.lstContProduct,

      /** Điểm lấy rỗng */
      emptyPickupLocationId: this.dataChoose.emptyPickupLocationId,
      emptyPickupLocationCode: this.dataChoose.emptyPickupLocationCode,
      emptyPickupLocationName: this.dataChoose.emptyPickupLocationName,
      emptyPickupLocationAddress: this.dataChoose.emptyPickupLocationAddress,
      emptyPickupTime: this.dataChoose.emptyPickupTime,

      /** Điểm đi */
      fromLocationId: this.dataChoose.fromLocationId,
      fromLocationCode: this.dataChoose.fromLocationCode,
      fromLocationName: this.dataChoose.fromLocationName,
      fromLocationAddress: this.dataChoose.fromLocationAddress,
      fromETD: this.dataChoose.fromETD,

      /** Điểm đến */
      toLocationId: this.dataChoose.toLocationId,
      toLocationCode: this.dataChoose.toLocationCode,
      toLocationName: this.dataChoose.toLocationName,
      toLocationAddress: this.dataChoose.toLocationAddress,
      toETD: this.dataChoose.toETD,

      /** Điểm trả rỗng */
      emptyReturnLocationId: this.dataChoose.emptyReturnLocationId,
      emptyReturnLocationCode: this.dataChoose.emptyReturnLocationCode,
      emptyReturnLocationName: this.dataChoose.emptyReturnLocationName,
      emptyReturnLocationAddress: this.dataChoose.emptyReturnLocationAddress,
      emptyReturnTime: this.dataChoose.emptyReturnTime,
    })
    delete this.dataChoose.pairingLocationId
    delete this.dataChoose.orderPairedId
    delete this.dataChoose.contTypeId
    delete this.dataChoose.quantity
    delete this.dataChoose.weight
    delete this.dataChoose.customerContractTermId
    delete this.dataChoose.lstContProduct
  }

  async onAddProduct() {
    if (!this.dataObject.productId) delete this.dataChooseProduct.packageTypeId
    const product = this.lstOfCusProductSrc.find((e: any) => e.productId == this.dataObject.productId)
    if (product) {
      this.dataChooseProduct.packageTypeId = product.packageTypeId
    }
    this.dataChoose.lstContProduct.push({
      productId: this.dataObject.productId,
      packageTypeId: this.dataChooseProduct.packageTypeId,

      /** Điểm lấy hàng */
      fromLocationId: this.dataChoose.fromLocationId,
      fromLocationCode: this.dataChoose.fromLocationCode,
      fromLocationName: this.dataChoose.fromLocationName,
      fromLocationAddress: this.dataChoose.fromLocationAddress,
      fromETD: this.dataChoose.fromETD,

      /** Điểm giao hàng */
      toLocationId: this.dataChoose.toLocationId,
      toLocationCode: this.dataChoose.toLocationCode,
      toLocationName: this.dataChoose.toLocationName,
      toLocationAddress: this.dataChoose.toLocationAddress,
      toETD: this.dataChoose.toETD,
    })
  }

  onChangeEmptyPickupLocation() {
    if (!this.dataChoose.emptyPickupLocationId) {
      delete this.dataChoose.emptyPickupLocationAddress
    }
    const emptyPickUpLocation = this.lstOfCusLocation.find((e: any) => e.id == this.dataChoose.emptyPickupLocationId)
    if (emptyPickUpLocation) {
      this.dataChoose.emptyPickupLocationCode = emptyPickUpLocation.code
      this.dataChoose.emptyPickupLocationName = emptyPickUpLocation.name
      this.dataChoose.emptyPickupLocationAddress = emptyPickUpLocation.address
    }
  }

  onChangeFromLocation() {
    if (!this.dataChoose.fromLocationId) {
      delete this.dataChoose.fromLocationAddress
    }
    const fromLocation = this.lstOfCusTakeProductLocation.find((e: any) => e.id == this.dataChoose.fromLocationId)
    if (fromLocation) {
      this.dataChoose.fromLocationAddress = fromLocation.address
      this.dataChoose.fromLocationCode = fromLocation.code
      this.dataChoose.fromLocationName = fromLocation.name
    }
  }

  onChangeToLocation() {
    if (!this.dataChoose.toLocationId) {
      delete this.dataChoose.toLocationAddress
    }
    const toLocation = this.lstOfCusDeliveryLocation.find((e: any) => e.id == this.dataChoose.toLocationId)
    if (toLocation) {
      this.dataChoose.toLocationAddress = toLocation.address
      this.dataChoose.toLocationCode = toLocation.code
      this.dataChoose.toLocationName = toLocation.name
    }
  }

  onChangeEmptyReturnLocation() {
    if (!this.dataChoose.emptyReturnLocationId) {
      delete this.dataChoose.emptyReturnLocationAddress
    }
    const emptyReturnLocation = this.lstOfCusLocation.find((e: any) => e.id == this.dataChoose.emptyReturnLocationId)
    if (emptyReturnLocation) {
      this.dataChoose.emptyReturnLocationAddress = emptyReturnLocation.address
      this.dataChoose.emptyReturnLocationCode = emptyReturnLocation.code
      this.dataChoose.emptyReturnLocationName = emptyReturnLocation.name
    }
  }

  async addOrEditContProduct(object: any, data: any) {
    this.dialog
      .open(AddContainerProductComponent, { data: [object, data], disableClose: false })
      .afterClosed()
      .subscribe(() => {})
  }

  async onChangeTransportType(event: any) {
    delete this.dataChoose.customerContractTermId
    delete this.dataObject.productId
    this.dataChoose = new Object()
    this.lstOfCusContractTerm = this.lstOfCusContractTermSrc.filter(
      (s: any) => s.transportType == event && s.serviceType == this.dataObject.serviceType
    )
  }

  async onChangeCustomerContractTerm() {
    this.loadCusLocation()
  }

  async onChangeProduct(event: any) {
    this.dataChoose = new Object()
  }

  // IMAGE
  // xóa url image
  handleClearImage(item: any) {
    this.dataObject.url = null
  }

  // show image
  handlePreview = async (file: NzUploadFile): Promise<void> => {
    // debugger
    if (!file.url?.match(/.(jpg|jpeg|png|gif)$/i)) {
      window.open(file.url, '_blank')
    } else {
      if (!file.url && !file['preview']) {
        file['preview'] = await getBase64(file.originFileObj!)
      }
      this.previewImage = file.url || file['preview']
      this.previewVisible = true
    }
  }

  handleChange(info: { file: NzUploadFile; fileList: NzUploadFile[] }): void {
    let arr = []
    switch (info.file.status) {
      case 'uploading':
        break
      case 'done':
        {
          if (info.fileList) {
            for (let item of info.fileList) {
              arr.push({
                name: item.name ? item.name : item?.originFileObj?.name,
                url: item.url ? item.url : item.response ? item.response[0] : '',
                uid: item.uid,
              })
            }
            this.dataObject.fileList = arr
          }
        }
        break
      case 'error':
        break
      case 'removed':
        {
          this.dataObject.fileList.forEach((item: { uid: string }, index: any) => {
            if (item.uid === info.file.uid) this.dataObject.fileList.splice(index, 1)
          })
        }
        break
    }
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
