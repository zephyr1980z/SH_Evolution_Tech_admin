import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../../core/enumData'
import { ApiService } from '../../../../../services/api.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'
import { customAlphabet } from 'nanoid'
import { User } from '../../../../../models/user.model'
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 10)
const fs = require('file-saver')
@Component({
  selector: 'app-add-or-edit-inventory-management',
  templateUrl: './add-or-edit-inventory-management.component.html',
})
export class AddOrEditInventoryManagementComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Chỉnh sửa phiếu kiểm'
  dataChoose: any
  inboundDetail: any
  loading = true
  dataSearch: any
  enumData = enumData
  lstItem: any = []
  lstItemSrc: any = []
  lstInBoundDetailScr: any = []
  lstInBoundDetail: any = []
  listOfData: any = []

  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  indeterminate = false
  setOfCheckedId = new Set<any>()
  checked = false
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditInventoryManagementComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadDataSearch()
    this.dataChoose = new Object()
    this.dataSearch = new Object()
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.isEditItem = true
    } else {
      this.modelTitle = 'Thêm mới phiếu kiểm'
      this.dataObject = new Object()
      this.dataObject.lstItem = []
      this.dataObject.code = `${nanoid()}`
      this.dataObject.inspectionDate = new Date()
      this.searchData()
    }
  }

  async searchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
    }
    this.loading = true
    const where: any = {}
    if (this.dataSearch.ibDetailCode && this.dataSearch.ibDetailCode !== '') {
      const key = 'ibDetailCode'
      where[key] = this.dataSearch.ibDetailCode
    }
    if (this.dataSearch.itemCode && this.dataSearch.itemCode !== '') {
      const key = 'itemCode'
      where[key] = this.dataSearch.itemCode
    }
    if (this.dataSearch.itemName && this.dataSearch.itemName !== '') {
      const key = 'itemName'
      where[key] = this.dataSearch.itemName
    }
    where['status'] = enumData.Inbound_Detail.DaNhap.code
    where['isDeleted'] = false
    this.apiService
      .post(this.apiService.INBOUND.FIND_ITEM_IN_INBOUND_DETAIL, {
        where,
        skip: (this.pageIndex - 1) * this.pageSize,
        take: this.pageSize,
      })
      .then((data) => {
        if (data) {
          this.loading = false
          this.total = data[1]
          this.listOfData = data[0]
          this.refreshCheckedStatus()
        }
      })
  }

  async loadDataSearch() {
    Promise.all([this.apiService.post(this.apiService.ITEM.FIND_WITH_SPECIFICATION, { isDeleted: false })]).then(
      (res) => {
        this.notifyService.hideloading()
        if (res) {
          this.lstItemSrc = res[0]
          this.lstItem = this.lstItemSrc
        }
      }
    )
  }

  clear() {
    this.dataObject = new Object()
  }

  onSave() {
    const data = this.dataObject
    if (data.id && data.id !== '') {
      // data.lstItem.forEach((e: any) => {
      //   if (+e.quantity < +e.realQuantity) {
      //     this.notifyService.showError(
      //       `Số lượng nhập thực ${e.realQuantity} không thể lớn hơn số lượng tồn ${e.quantity}!`
      //     )
      //     return
      //   }
      // })
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  addObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.INVENTORY_MANAGEMENT.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.INVENTORY_MANAGEMENT.UPDATE, data).then((result) => {
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

  async onAddItem() {
    if (this.dataObject.lstItem.length < 1) {
      for (let e of this.setOfCheckedId) {
        this.dataObject.lstItem.push({
          ibCode: e.ibCode,
          inboundId: e.ibId,
          itemId: e.itemId,
          itemName: e.itemName,
          itemCode: e.itemCode,
          ibDetailCode: e.ibDetailCode,
          inboundDetailId: e.ibDetailId,
          quantity: e.quantity,
          realQuantity: e.quantity,
          // quantityDeviant: e.quantity - e.realQuantity,
        })
      }
    } else {
      for (let e of this.setOfCheckedId) {
        let findDupicateItemInIbDetail: any = this.dataObject.lstItem.find(
          (c: any) => c.itemId == e.itemId && c.ibDetailCode == e.ibDetailCode && c.ibCode == e.ibCode
        )
        if (findDupicateItemInIbDetail?.itemId != '' && findDupicateItemInIbDetail?.itemId != undefined) continue
        else {
          this.dataObject.lstItem.push({
            ibCode: e.ibCode,
            inboundId: e.ibId,
            itemId: e.itemId,
            itemName: e.itemName,
            itemCode: e.itemCode,
            ibDetailCode: e.ibDetailCode,
            inboundDetailId: e.ibDetailId,
            quantity: e.quantity,
            realQuantity: e.quantity,
            // quantityDeviant: e.quantity - e.realQuantity,
          })
        }
      }
    }

    // this.dataChoose.realQuantity = Number(this.dataChoose.realQuantity)
    // if (this.dataChoose.realQuantity < this.dataChoose.quantity) {
    //   this.notifyService.showError('Số lượng thực không nhỏ hơn số lượng sản phẩm còn trong kho!')
    //   return
    // } else {
    //   await this.dataObject.lstItem.push({
    //     itemId: this.dataChoose.itemId,
    //     itemName: this.dataChoose.itemName,
    //     itemDetailCode: this.dataChoose.itemDetailCode,
    //     itemDetailQuantity: this.dataChoose.itemDetailQuantity,
    //     realQuantity: this.dataChoose.realQuantity,
    //     diff: Math.abs(this.dataChoose.itemDetailQuantity - this.dataChoose.realQuantity),
    //   })
    //   delete this.dataChoose.itemId
    //   delete this.dataChoose.itemDetailQuantity
    //   delete this.dataChoose.inboundDetailId
    //   delete this.dataChoose.itemDetailCode
    //   delete this.dataChoose.realQuantity
    // }
    this.setOfCheckedId = new Set<any>()
    this.checked = false
  }

  onItemChecked(id: number, checked: boolean) {
    this.updateCheckedSet(id, checked)
    this.refreshCheckedStatus()
  }

  onAllChecked(value: boolean) {
    this.setOfCheckedId = new Set<any>()
    this.listOfData.forEach((item: any) => this.updateCheckedSet(item, value))
    this.refreshCheckedStatus()
  }

  refreshCheckedStatus() {
    this.checked = this.listOfData.every((item: any) => this.setOfCheckedId.has(item))
    this.indeterminate = this.listOfData.some((item: any) => this.setOfCheckedId.has(item)) && !this.checked
  }

  updateCheckedSet(id: number, checked: boolean) {
    if (checked) {
      this.setOfCheckedId.add(id)
    } else {
      this.setOfCheckedId.delete(id)
    }
  }

  onCurrentPageDataChange($event: any) {
    this.listOfData = $event
    this.refreshCheckedStatus()
  }
}
