import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../../core/enumData'
import { ApiService } from '../../../../../services/api.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'
import { customAlphabet } from 'nanoid'
const nanoidForOutbound = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 10)
@Component({
  selector: 'app-add-or-edit-outbound-model',
  templateUrl: './add-or-edit-outbound-model.component.html',
})
export class AddOrEditOutboundModelComponent implements OnInit {
  isEditItem = false
  modelTitle = 'CHỈNH SỬA PHIẾU XUẤT'
  listOfData: any = []
  dataChoose: any
  dataObject: any
  lstItem: any = []
  lstItemSrc: any = []
  lstItemDetail: any = []
  lstItemDetailScr: any = []
  dataInbuond: any
  outboundDetail: any
  isVisible = false
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditOutboundModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.loadDataSearch()
    this.dataChoose = new Object()
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      Promise.all([
        this.apiService.post(this.apiService.ITEM.FIND_WITH_SPECIFICATION, { isDeleted: false }),
        this.apiService.post(this.apiService.ITEM_DETAIL.FIND, { isDeleted: false }),
      ]).then((res) => {
        this.notifyService.hideloading()
        if (res) {
          this.lstItemSrc = res[0].filter(
            (e: any) => e.specificationId != '' && e.specificationId != null && e.quantity > 0
          )
          this.lstItem = this.lstItemSrc
          this.lstItemDetailScr = res[1]
          this.lstItemDetail = res[1]
        }
      })
      this.isEditItem = true
    } else {
      this.modelTitle = 'THÊM MỚI PHIẾU XUẤT'
      this.dataObject = new Object()
      this.dataChoose = new Object()
      this.dataObject.lstItem = []
      this.dataObject.code = `${nanoidForOutbound()}`
    }
  }

  async loadDataSearch() {
    Promise.all([
      this.apiService.post(this.apiService.ITEM.FIND_WITH_SPECIFICATION, { isDeleted: false }),
      this.apiService.post(this.apiService.ITEM_DETAIL.FIND, { isDeleted: false }),
    ]).then((res) => {
      this.notifyService.hideloading()
      if (res) {
        this.lstItemSrc = res[0].filter(
          (e: any) => e.specificationId != '' && e.specificationId != null && e.quantity > 0
        )
        this.lstItem = this.lstItemSrc
        this.lstItemDetailScr = res[1]
        this.lstItemDetail = res[1]
      }
    })
  }

  onChangeItem(event: any) {
    delete this.dataChoose.itemQuantity
    delete this.dataChoose.baseUnitId
    delete this.dataChoose.itemDetaiId

    delete this.dataChoose.quantity
    delete this.dataChoose.price
    delete this.dataChoose.description

    const item = this.lstItem.find((x: any) => x.id == event)
    this.dataChoose.itemName = item.name

    const itemSpecification = this.lstItemSrc.find((x: any) => x.id == event)
    this.dataChoose.baseUnitId = itemSpecification.baseUnitId
    this.dataChoose.baseUnitName = itemSpecification.baseUnitName

    const itemDetail = this.lstItemDetailScr.find((e: any) => e.itemId == event)
    this.dataChoose.itemDetailId = itemDetail.id
    this.dataChoose.itemDetailCode = itemDetail.code
    this.dataChoose.itemQuantity = itemDetail.quantity
    this.dataChoose.expiryDate = itemDetail.expiryDate
    this.dataChoose.manufactureDate = itemDetail.manufactureDate
    this.dataChoose.price = itemDetail.itemImportPrice
  }

  onSave() {
    const data = this.dataObject
    if (data.id && data.id !== '') {
      this.dataObject.lstItem.forEach((e: any) => {
        if (e.itemId == undefined) {
          this.notifyService.showError('Không được để trống Phụ Tùng!')
          return
        } else if (e.quantity == undefined || e.quantity == 0) {
          this.notifyService.showError('Không được để trống Số Lượng Xuất!')
          return
        }
      })
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  async addObject(data: any) {
    this.notifyService.showloading()
    const lstItDetail: any = this.lstItemDetail.map((item: any) => ({ ...item }))
    for (let e of data.lstItem) {
      const findItem = lstItDetail.find((item: any) => e.itemDetailId == item.id && item.itemId == e.itemId)
      if (findItem) findItem.quantity = findItem.quantity - e.quantity
    }
    for (let i of lstItDetail) {
      const num = +i.quantity
      if (num < 0) {
        this.notifyService.showError('Số lượng xuất lơn hơn số lượng item có trong lô!')
        return
      }
    }
    this.apiService.post(this.apiService.OUTBOUND.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.OUTBOUND.UPDATE, data).then((result) => {
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

  clear() {
    this.dataObject = new Object()
  }

  async onAddItem() {
    if (this.dataChoose.itemQuantity < this.dataChoose.quantity) {
      this.notifyService.showError('Số lượng xuất lớn hơn số lượng sản phẩm còn trong kho!')
      return
    } else if (this.dataChoose.quantity == 0) {
      this.notifyService.showError('Không thể xuất số lượng bằng 0')
      return
    } else {
      const findItem = this.dataObject.lstItem.find(
        (item: any) => item.itemId == this.dataChoose.itemId && +item.price == +this.dataChoose.price
      )
      if (findItem) findItem.quantity = +findItem.quantity + +this.dataChoose.quantity
      else {
        await this.dataObject.lstItem.push({
          itemId: this.dataChoose.itemId,
          itemName: this.dataChoose.itemName,
          itemQuantity: this.dataChoose.itemQuantity,
          itemDetailId: this.dataChoose.itemDetailId,
          itemDetailCode: this.dataChoose.itemDetailCode,
          baseUnitName: this.dataChoose.baseUnitName,
          quantity: this.dataChoose.quantity,
          price: this.dataChoose.price,
          description: this.dataChoose.description,
        })
      }

      delete this.dataChoose.itemId
      delete this.dataChoose.itemQuantity
      delete this.dataChoose.baseUnitId
      delete this.dataChoose.itemDetailId
      delete this.dataChoose.itemDetailCode
      delete this.dataChoose.quantity
      delete this.dataChoose.price
      delete this.dataChoose.description
      delete this.dataChoose.expiryDate
      delete this.dataChoose.manufactureDate
    }
  }

  onDelete(index: any) {
    this.dataObject.lstItem.splice(index, 1)
  }

  clickEditOutboundDetail(data: any) {
    this.isVisible = true
    this.outboundDetail = data
    const item = this.lstItem.find((e: any) => e.id == this.outboundDetail.itemId)
    if (item) {
      this.outboundDetail.baseUnitName = item.baseUnitName
      this.onChangeItem(this.outboundDetail.itemId)
    }
  }

  onCancelEditOutbound() {
    this.isVisible = false
    delete this.outboundDetail
  }

  onSaveOutboundDetail(data: any) {
    this.isVisible = false
    delete this.outboundDetail
  }
}
