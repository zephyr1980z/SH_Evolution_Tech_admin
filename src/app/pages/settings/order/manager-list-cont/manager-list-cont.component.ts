import { Component, Inject, OnInit, Optional, TemplateRef } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import * as moment from 'moment'
import { NzModalService } from 'ng-zorro-antd/modal'
import { enumData } from '../../../../core/enumData'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-manager-list-cont',
  templateUrl: './manager-list-cont.component.html',
})
export class ManagerListContComponent implements OnInit {
  modelTitle = ''
  currentUser: any
  enumData: any = enumData
  lstDriver: any[] = []
  lstLocation: any[] = []
  lstContractTerm: any[] = []
  lstContType: any[] = []
  lstOrder: any[] = []
  lstEmployee: any[] = []
  constructor(
    private dialogRef: MatDialogRef<ManagerListContComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dataParent: any,
    private apiService: ApiService,
    private notifyService: NotifyService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService,
    private modal: NzModalService
  ) {
    // this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
    // this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x?.enumData))
  }
  dataMoney: any
  dataObject: any = {}
  dataObjectItem: any = {}
  dataMaster: any
  hide = false
  statusPayment: any = []
  tongTienPhaiTra = 0
  dateFormat = 'dd/MM/yyyy'
  totalEWallet = 0
  screenWidth: any
  listPaymentType: any[] = []
  dataManager: any = []
  DebtCustomer: any = enumData.Role.DebtCustomer

  // TABLE DATA
  listOfData: any[] = []
  checked = false
  indeterminate = false
  listOfCurrentPageData: any[] = []
  setOfCheckedId = new Set<any>()
  mapOfCheckedId = new Map<string, any>()
  isChooseAddAll: boolean = false
  checkedLst: any[] = []
  loading = false
  customerId: any = ''
  isSave = false
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  hashMapLocation: any = {}
  dataSearch: any = {}

  isConfirm: boolean = false

  async ngOnInit() {
    await Promise.all([
      this.apiService.post(this.apiService.LOCATION.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.CUSTOMER_CONTRACT_TERM.FIND_WITH_CONDITIONS, {
        customerContractId: this.dataParent.customerContractId,
        serviceType: this.dataParent.serviceType,
        isDeleted: false,
      }),
      this.apiService.post(this.apiService.CONT_TYPE.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.ORDER.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.EMPLOYEE.FIND, { isDeleted: false }),
    ]).then((res) => {
      this.notifyService.hideloading()
      this.lstLocation = res[0]
      this.lstContractTerm = res[1]
      this.lstContType = res[2]
      this.lstOrder = res[3]
      this.lstEmployee = res[4]
    })
    this.hashMapLocation = await this.coreService.arrayToObject(this.lstLocation)
    this.modelTitle = `Quản lí container đã gửi điều phối`
    // this.loadListCollect()
    this.searchData()
    // this.listPaymentType = this.coreService.convertObjToArray(this.enumData.PaymentTypeFee)

    // this.dataObject = new Object()
    // if (this.data) {
    //   this.dataMaster = this.data
    //   this.loadDetail()
    // }
    // this.screenWidth = window.screen.width
    // this.statusPayment = this.coreService.convertObjToArray(this.enumData.PaymentType)
  }

  disabledDate = (current: Date): boolean => {
    return moment(current).format('YYYY-MM') !== moment(this.dataParent.date).format('YYYY-MM')
  }

  async filterDataSearch() {
    const where: any = {}

    if (this.dataMaster.createdAt && this.dataMaster.createdAt !== '') {
      where['createdAt'] = this.dataMaster.createdAt
    }
    if (this.dataMaster.customerId && this.dataMaster.customerId !== '') {
      where['customerId'] = this.dataMaster.customerId
    }
    if (this.dataMaster.status && this.dataMaster.status !== '') {
      where['status'] = this.dataMaster.status
    }
    return where
  }

  async searchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
      this.mapOfCheckedId.clear()
    }
    this.loading = true

    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)

    // ADD CONDITION
    where.orderId = this.dataParent.id

    const dataSearch = {
      where,
      skip: 0,
      take: enumData.Page.pageSizeMax,
    }
    await this.apiService.post(this.apiService.ORDER_CONT.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.listOfData = data[0]
        this.total = data[1]
      }
    })
  }

  async onClickIsDeleted(dataRow: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ORDER_CONT.DELETE, { id: dataRow.id, note: dataRow.note }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  // TABLE--start
  onCheckAll() {
    if (this.mapOfCheckedId.size > 0) {
      this.mapOfCheckedId.clear()
    } else {
      for (const dataRow of this.listOfData) {
        if (!dataRow.isDeleted) this.mapOfCheckedId.set(dataRow.id, dataRow)
      }
    }
    this.autoFillField()
  }

  onItemChecked(dataRow: any, checked: boolean) {
    if (this.mapOfCheckedId.has(dataRow.id)) {
      this.mapOfCheckedId.delete(dataRow.id)
    } else {
      this.mapOfCheckedId.set(dataRow.id, dataRow)
    }

    this.autoFillField()
  }

  autoFillField() {
    if (this.mapOfCheckedId.size === 0) {
      Object.keys(this.dataObject).forEach((prop) => {
        delete this.dataObject[prop]
      })
    } else if (this.mapOfCheckedId.size === 1) {
      const firstValue = Array.from(this.mapOfCheckedId.values())[0]
      const properties = [
        'contTypeId',
        'weight',
        'customerContractTermId',
        'emptyPickupLocationId',
        'emptyPickupTime',
        'fromLocationId',
        'fromETD',
        'toLocationId',
        'toETD',
        'emptyReturnLocationId',
        'emptyReturnTime',
        'orderPairedId',
        'pairingLocationId',
      ]

      properties.forEach((property) => {
        this.dataObject[property] = firstValue[property]
      })
    } else {
      const firstValue = Array.from(this.mapOfCheckedId.values())[0]
      const properties = [
        'contTypeId',
        'weight',
        'customerContractTermId',
        'emptyPickupLocationId',
        'emptyPickupTime',
        'fromLocationId',
        'fromETD',
        'toLocationId',
        'toETD',
        'emptyReturnLocationId',
        'emptyReturnTime',
        'orderPairedId',
        'pairingLocationId',
      ]

      properties.forEach((property) => {
        this.dataObject[property] = Array.from(this.mapOfCheckedId.values()).every(
          (val) => val[property] === firstValue[property]
        )
          ? firstValue[property]
          : null
      })
    }
  }
  // TABLE--end

  async loadListCollect() {
    // // this.notifyService.showloading()
    // // let where.feeOpsInvoiceId
    // const dataSearch = {
    //   feeOpsInvoiceId: this.dataParent.id,
    // }
    // await this.apiService.post(this.apiService.FEE_OPS_INVOICE_COLLECT.FIND, dataSearch).then(async (res: any[]) => {
    //   this.notifyService.hideloading()
    //   // res.forEach((item: any) => {
    //   //   item.paid = 0
    //   //   item.paymentDateSource = item.paymentDate
    //   //   item.paymentDate = null
    //   //   this.tongTienPhaiTra += Number(item.moneyLeft)
    //   // })
    //   // res.sort((a: any, b: any) => (a.paymentDateSource > b.paymentDateSource ? 1 : -1))
    //   this.listOfData = res
    // })
  }

  showAddress() {
    const emptyPickupLocation = this.hashMapLocation[this.dataObject.emptyPickupLocationId]
    const fromLocation = this.hashMapLocation[this.dataObject.fromLocationId]
    const toLocation = this.hashMapLocation[this.dataObject.toLocationId]
    const emptyReturnLocation = this.hashMapLocation[this.dataObject.emptyReturnLocationId]
    this.dataObject.emptyPickupLocationAddress = emptyPickupLocation.address
    this.dataObject.fromLocationAddress = fromLocation.address
    this.dataObject.toLocationAddress = toLocation.address
    this.dataObject.emptyReturnLocationAddress = emptyReturnLocation.address
  }

  async onSave() {
    const lstOrderCont = Array.from(this.mapOfCheckedId.values())
    for (const orderCont of lstOrderCont) {
      Object.assign(orderCont, this.dataObject)
    }
    const data = {
      lstOrderCont,
      isConfirm: this.isConfirm,
    }
    this.notifyService.showloading()
    await this.apiService.post(this.apiService.ORDER_CONT.UPDATE_LIST_DATA, data).then(async (res: any) => {
      this.notifyService.hideloading()
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.dataObject = {}
      this.mapOfCheckedId.clear()
      // debugger
      this.searchData()
      // this.closeDialog()
    })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }

  onPaidMoney(arr: any[], moneyInput: number) {
    this.listOfData.forEach((item: any) => {
      item.paid = 0
      item.paymentDate = null
    })

    let temp = moneyInput
    for (let item of arr) {
      item.paid = temp >= item.moneyLeft ? item.moneyLeft : temp
      temp = temp - item.paid
      if (!item.paymentDate) {
        item.paymentDate = this.dataObject.paymentDate
      }
      if (temp === 0) {
        break
      }
    }
  }

  setPaidItem(obj: { paid: number; moneyLeft: number; paymentType: any }) {
    const params = []
    let flag = false
    if (obj.paid <= obj.moneyLeft) {
      obj.paymentType = this.dataObject.paymentType
      params.push(obj)
      flag = true
    }
    if (flag === true) {
      this.notifyService.showloading()
      this.apiService.post(this.apiService.CUSTOMER_DEBT.UPDATE, params).then((res: any) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
        this.apiService.eventSearchData.next(true)
      })
    }
  }

  onBlurMoneny(obj: { paid: number; price: number; isDeleted: boolean }) {
    if (obj.paid > obj.price) {
      obj.isDeleted = true
    } else {
      obj.isDeleted = false
    }
  }

  async clickCancel() {
    delete this.dataObject.contTypeId
    delete this.dataObject.weight
    delete this.dataObject.customerContractTermId
    delete this.dataObject.emptyPickupLocationId
    delete this.dataObject.emptyPickupTime
    delete this.dataObject.fromLocationId
    delete this.dataObject.fromETD
    delete this.dataObject.toLocationId
    delete this.dataObject.toETD
    delete this.dataObject.emptyReturnLocationId
    delete this.dataObject.emptyReturnTime
  }

  // async saveData() {
  //   const data: any = {}
  //   data.this.apiService.post(this.apiService.ORDER_CONT.UPDATE_LIST_DATA, data).then((result) => {
  //     if (result) {
  //       this.notifyService.hideloading()
  //       this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
  //       this.searchData()
  //       this.dataObjectItem = {}
  //       // this.closeDialog()
  //     }
  //   })
  // }

  setActiveItem(dataRow: any) {
    // this.notifyService.showloading()
    // this.apiService.post(this.apiService.DRIVER_DAY_OFF.DELETE, { id: dataRow.id }).then((res) => {
    //   this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
    //   this.notifyService.hideloading()
    //   this.searchData()
    // })
  }

  clickEdit(dataRow: any) {
    this.dataObjectItem = dataRow
  }

  // (click)="createTplModal(tplTitle, tplContent, tplFooter)
  createTplModal(tplContent: TemplateRef<{}>, dataRow: any): void {
    this.modal.create({
      nzTitle: 'Lí do hủy',
      nzContent: tplContent,
      // nzFooter: 'tplFooter',
      // nzMaskClosable: false,
      // nzClosable: false,
      // nzComponentParams: {
      //   value: dataRow.note,
      // },
      nzComponentParams: dataRow,

      nzOnOk: () => this.onClickIsDeleted(dataRow),
    })
  }

  confirm() {
    this.isConfirm = true
    this.onSave()
  }
  cancel() {
    this.isConfirm = true
    this.onSave()
  }
}
