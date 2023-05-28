import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { ApiService } from '../../../../../services/api.service'
import { NotifyService } from '../../../../../services/notify.service'
import { enumData } from '../../../../../core/enumData'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { CoreService } from '../../../../../services/core.service'
import { customAlphabet } from 'nanoid'
const nanoidForInbound = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 10)

@Component({
  selector: 'app-add-or-inbound-model',
  templateUrl: './add-or-edit-inbound-model.component.html',
})
export class AddOrEditInboundModelComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'CHỈNH SỬA NHẬP KHO'
  lstItemGroup: any = []
  lstItemSrc: any = []
  lstItem: any = []
  lstItemSupplier: any = []
  inboundId: any
  dataChoose: any
  enumData = enumData
  isVisible = false
  inboundDetail: any
  radioValue = 'A'
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditInboundModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.loadAllData()
    this.dataChoose = new Object()
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      Promise.all([
        this.apiService.post(this.apiService.ITEM.FIND, { isDeleted: false }),
        this.apiService.post(this.apiService.ITEM_SUPPLIER.FIND, { isDeleted: false }),
      ]).then(async (res) => {
        if (res) {
          this.lstItemSrc = res[0]
          this.lstItem = res[0]
          this.lstItemSupplier = res[1].filter((e: any) => e.lstItemOfSup.length > 0)
          this.onChangeItemSupplier(this.dataObject.supplierId)
          this.isEditItem = true
        }
      })
    } else {
      this.modelTitle = 'THÊM MỚI NHẬP KHO '
      this.dataObject = new Object()
      this.dataObject.lstItem = []
      this.dataObject.code = `${nanoidForInbound()}`
    }
  }

  async loadAllData() {
    Promise.all([
      this.apiService.post(this.apiService.ITEM.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.ITEM_SUPPLIER.FIND, { isDeleted: false }),
    ]).then(async (res) => {
      if (res) {
        this.lstItemSrc = res[0]
        this.lstItem = res[0]
        this.lstItemSupplier = res[1].filter((e: any) => e.lstItemOfSup.length > 0)
      }
    })
  }

  clear() {
    this.dataObject = new Object()
  }

  onSave() {
    const data = this.dataObject
    if (data.id && data.id !== '') {
      let strError = ''
      data.lstItem.forEach((e: any) => {
        if (+e.quantity < +e.estimatedQuantity) {
          strError += `Số lượng nhập thực ${e.quantity} phải bé hơn hoặc bằng số lượng nhập dự kiến ${e.estimatedQuantity}!`
        }
        if (e.manufactureDate && e.expiryDate) {
          if (e.manufactureDate > e.expiryDate)
            strError += `Ngày sản xuất ${e.manufactureDate} phải lớn hơn hoặc hạn sử dụng ${e.expiryDate}!`
        }
      })
      if (strError.length > 0) {
        this.notifyService.showError(strError)
        return
      }
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  addObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.INBOUND.CREATE, data).then((result) => {
      this.notifyService.hideloading()
      this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
      this.closeDialog()
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.INBOUND.UPDATE, data).then((result) => {
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

  onAddItem() {
    if (this.dataChoose.expiryDate && this.dataChoose.manufactureDate)
      if (this.dataChoose.expiryDate < this.dataChoose.manufactureDate) {
        this.notifyService.showError('Hạn sử dụng không thể bé hơn ngày sản xuất')
        return
      }
    /** Check xem user chọn đơn vị cơ sở hay đơn vị, nếu chọn đơn vị cơ sở thì hệ số = 1, còn nếu đơn vị thì hệ số = this.dataChoose.specQuantity  */
    let coefficient = 1
    if (this.radioValue == 'B') coefficient = +this.dataChoose.specQuantity
    for (let e of this.dataObject.lstItem) {
      if (
        e.itemId == this.dataChoose.itemId &&
        new Date(e.expiryDate).toDateString() == new Date(this.dataChoose.expiryDate).toDateString() &&
        new Date(e.manufactureDate).toDateString() == new Date(this.dataChoose.manufactureDate).toDateString() &&
        e.importprice == this.dataChoose.importprice
      ) {
        const quantity = +e.quantity
        e.quantity =
          quantity +
          (+this.dataChoose.quantity ? +this.dataChoose.quantity : +this.dataChoose.estimatedQuantity) * coefficient
        this.dataChoose = new Object()
        return
      }
    }
    if (+this.dataChoose.estimatedQuantity < +this.dataChoose.quantity) {
      this.notifyService.showError('Só lượng nhập dự kiến phải lớn hơn hoặc bằng số lượng nhập thực!')
      return
    }
    this.dataChoose.total = +this.dataChoose.estimatedQuantity * coefficient * +this.dataChoose.importprice
    this.dataObject.lstItem.push({
      itemId: this.dataChoose.itemId,
      baseUnitName: this.dataChoose.baseUnitName,
      itemName: this.dataChoose.itemName,
      expiryDate: this.dataChoose.expiryDate,
      manufactureDate: this.dataChoose.manufactureDate,
      quantity:
        (+this.dataChoose.quantity ? +this.dataChoose.quantity : this.dataChoose.estimatedQuantity) * coefficient,
      estimatedQuantity: this.dataChoose.estimatedQuantity * coefficient,
      importprice: this.dataChoose.importprice,
      total: this.dataChoose.total,
      description: this.dataChoose.description,
    })
    this.dataChoose = new Object()
    this.radioValue = 'A'
  }

  onDelete(index: any) {
    this.dataObject.lstItem.splice(index, 1)
  }

  async onChangeItem(data: any) {
    delete this.dataChoose.baseUnitName
    delete this.dataChoose.itemName
    delete this.dataChoose.unitName
    delete this.dataChoose.specQuantity
    const item = await this.lstItem.find((e: any) => e.id == data)
    if (item) {
      this.dataChoose.baseUnitName = item.baseUnitName
      this.dataChoose.unitName = item.unitName
      this.dataChoose.specQuantity = +item.specQuantity
      this.dataChoose.itemName = item.name
    }
  }
  onChangeItemSupplier(data: string) {
    delete this.dataChoose.itemId
    const sup = this.lstItemSupplier.find((c: any) => c.id == data)
    this.lstItem = this.lstItemSrc.filter((e: any) => sup.lstItemOfSup.includes(e.id))
  }

  clickEditInboundDetail(data: any) {
    this.isVisible = true
    this.inboundDetail = data
    const item = this.lstItem.find((e: any) => e.id == this.inboundDetail.itemId)
    if (item) {
      this.inboundDetail.baseUnitName = item.baseUnitName
    }
  }

  onCancelEditInbound() {
    this.isVisible = false
    delete this.inboundDetail
  }

  onSaveInboundDetail(data: any) {
    this.isVisible = false
    delete this.inboundDetail
  }
}
