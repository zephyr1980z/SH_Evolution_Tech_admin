import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../../core/enumData'
import { ApiService } from '../../../../../services/api.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'
import { customAlphabet } from 'nanoid'
const nanoidForInbound = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 10)
@Component({
  selector: 'app-add-or-edit-assembly-certificate',
  templateUrl: './add-or-edit-assembly-certificate.component.html',
})
export class AddOrEditAssemblyCertificateComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Chỉnh sửa giấy yêu cầu lắp ráp máy'

  lstItemSrc: any = []
  lstItem: any = []
  dataChoose: any
  lstAssemblyOfSparePartsSrc: any = []
  lstAssemblyOfSpareParts: any = []
  lstItemDetailScr: any = []
  lstItemDetail: any = []

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditAssemblyCertificateComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.loadDataSearch()
    if (this.data && this.data !== null) {
      this.isEditItem = true
      this.dataObject = this.data
    } else {
      this.modelTitle = 'Thêm mới phiếu yêu cầu lắp ráp máy'
      this.dataObject = new Object()
      this.dataChoose = new Object()
      this.dataObject.code = `${nanoidForInbound()}`
      this.dataObject.lstItem = []
      this.dataObject.lstItemNeed = []
    }
  }

  async loadDataSearch() {
    Promise.all([
      this.apiService.post(this.apiService.ITEM.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.ASSEMBLY_OF_SQUARE_PARTS.FIND_FOR_UPDATE, { isDeleted: false }),
      this.apiService.post(this.apiService.ITEM_DETAIL.FIND, { isDeleted: false }),
    ]).then((res) => {
      this.notifyService.hideloading()
      this.lstItemSrc = res[0] || []
      this.lstAssemblyOfSparePartsSrc = res[1] || []
      this.lstAssemblyOfSpareParts = res[1] || []
      this.lstItemDetailScr = res[2] || []
      this.lstItemDetail = res[2] || []
    })
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

  async addObject(data: any) {
    let error = 0
    const lstItemDetail = this.lstItemDetail
    /** Kiểm tra số lượng trong kho có đủ để lắp ráp máy không */
    for (let e of data.lstItem) {
      for (let i of lstItemDetail) {
        if (e.itemDetailId == i.id && i.itemId == e.itemId) {
          i.itemDetailQuantity = i.itemDetailQuantity - e.quantity
        }
      }
    }
    const lstItemDetailLeft: any = await lstItemDetail.map((e: any) => e.itemDetailQuantity)
    let minQuantityLeft = Math.min(...lstItemDetailLeft)
    if (minQuantityLeft < 0) {
      this.notifyService.showError('Số lượng xuất lơn hơn số lượng item có trong lô!')
      error++
    }
    const val: any = await this.dataObject.lstItem.reduce((c: any, i: any) => {
      c[i.itemId] = (c[i.itemId] || 0) + parseFloat(i.quantity)
      return c
    }, {})

    /** Kiểm tra số lương phụ tùng của phiếu yêu cầu phải bằng số lượng phụ tùng được thêm vào */
    data.lstItemNeed.forEach((c: any) => {
      let quantityMultiplied = c.quantity * this.dataObject.quantity
      if (val[c.id] != quantityMultiplied) {
        this.notifyService.showError(
          'Bạn phải nhập số lượng phụ tùng bằng số lượng phu tùng cần thiết trong phiếu yêu cầu!'
        )
        error++
      }
    })

    if (error > 0) {
      await this.apiService.post(this.apiService.ITEM_DETAIL.FIND, { isDeleted: false }).then(async (res) => {
        {
          this.lstItemDetail = res
          this.lstItemDetailScr = res
        }
      })
      return
    }

    this.notifyService.showloading()
    this.apiService.post(this.apiService.ASSEMBLY_CERTIFICATE.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ASSEMBLY_CERTIFICATE.UPDATE, data).then((result) => {
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
  onDelete(index: any) {
    this.dataObject.lstItem.splice(index, 1)
  }

  onAddItem() {
    if (this.dataChoose.itemQuantity < this.dataChoose.quantity) {
      this.notifyService.showError('Số lượng xuất nhỏ hơn số lượng sản phẩm còn trong kho!')
      return
    }
    let item = this.dataObject.lstItem.find(
      (s: any) => s.itemId == this.dataChoose.itemId && s.itemDetailCode == this.dataChoose.itemDetailCode
    )
    if (item) {
      item.quantity = item.quantity + +this.dataChoose.quantity
    } else {
      this.dataObject.lstItem.push({
        itemId: this.dataChoose.itemId,
        itemDetailCode: this.dataChoose.itemDetailCode,
        itemDetailId: this.dataChoose.itemDetailId,
        itemName: this.dataChoose.itemName,
        baseUnitName: this.dataChoose.baseUnitName,
        quantity: this.dataChoose.quantity,
      })
    }
    this.dataChoose = new Object()
  }

  async onChangeAssemblyOfSquareParts() {
    delete this.dataChoose.itemQuantity
    delete this.dataChoose.baseUnitId
    delete this.dataChoose.itemId
    delete this.dataChoose.itemDetailId
    delete this.dataChoose.quantity
    delete this.dataChoose.price
    delete this.dataChoose.manufactureDate
    delete this.dataChoose.expiryDate
    delete this.dataChoose.description
    delete this.dataChoose.itemDetailCode

    const assemblyOfSquareParts = this.lstAssemblyOfSparePartsSrc.find(
      (e: any) => e.id == this.dataObject.assemblyOfSparePartsId
    )
    if (assemblyOfSquareParts) {
      this.dataObject.lstItemNeed = assemblyOfSquareParts.lstItem
      /** List item đã distinct */
      const lstItemId = this.dataObject.lstItemNeed.map((e: any) => e.id)

      /** Lọc những item nằm trong danh sách các phụ tùng cần cho việc lắp ráp máy */
      this.lstItem = this.lstItemSrc.filter((e: any) => lstItemId.includes(e.id))
    }
  }

  onChangeItem(event: any) {
    delete this.dataChoose.itemDetailId
    delete this.dataChoose.quantity
    delete this.dataChoose.price
    delete this.dataChoose.manufactureDate
    delete this.dataChoose.expiryDate
    delete this.dataChoose.description
    delete this.dataChoose.itemQuantity
    delete this.dataChoose.baseUnitId
    const item = this.lstItemSrc.find((x: any) => x.id == event)
    this.dataChoose.itemName = item.name
    this.dataChoose.price = item.importPrice
    const itemSpecification = this.lstItemSrc.find((x: any) => x.id == event)
    this.dataChoose.baseUnitId = itemSpecification.baseUnitId
    this.dataChoose.baseUnitName = itemSpecification.baseUnitName
    this.dataChoose.itemQuantity = item.quantity

    const itemDetail = this.lstItemDetailScr.find((e: any) => (e.itemId = event))
    if (itemDetail) {
      this.dataChoose.manufactureDate = itemDetail.manufactureDate
      this.dataChoose.expiryDate = itemDetail.expiryDate
      this.dataChoose.itemDetailCode = itemDetail.code
      this.dataChoose.itemDetailId = itemDetail.id
    }
  }
}
