import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { ApiService } from '../../../../services/api.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-add-contract',
  templateUrl: './add-or-copy-contract.component.html',
})
export class AddOrCopyContractComponent implements OnInit {
  enumData: any
  dataObject: any
  isEditItem = false

  dataCustomer: any[] = []
  modelTitle = 'THÊM MỚI HỢP ĐỒNG'

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddOrCopyContractComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.dataObject = new Object()
    this.loadDataSearch()
    if (this.data && this.data != null) {
      this.dataObject = this.data
    }
  }

  onSave() {
    const data = this.dataObject
    if (data.signDate > data.effectDate) {
      this.notifyService.showError(`Ngày kí không thể lớn hơn ngày có hiệu lực`)
      this.notifyService.hideloading()
      return
    }
    if (data.effectDate > data.expireDate) {
      this.notifyService.showError(`Ngày hết hiệu lực không thể có trước hơn ngày có hiệu lực`)
      this.notifyService.hideloading()
      return
    }
    if (data.signDate > data.expireDate) {
      this.notifyService.showError(`Ngày kí không thể lớn hơn ngày hết hiệu lực`)
      this.notifyService.hideloading()
      return
    }
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CONTRACT.CREATE, this.dataObject).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  loadDataSearch() {
    Promise.all([this.apiService.post(this.apiService.CUSTOMER.FIND, { where: { isDeleted: false } })]).then(
      async (res) => {
        this.dataCustomer = res[0] || []
      }
    )
  }

  closeDialog() {
    this.notifyService.hideloading()
    this.dialogRef.close(1)
  }

  loadData() {
    this.notifyService.showloading()
    if (this.data && this.data !== null) {
      this.apiService.post(this.apiService.CONTRACT.FIND_FOR_UPDATE, { id: this.data.id }).then((result) => {
        if (result) {
          this.notifyService.hideloading()
          this.dataObject = {
            ...result.contract,
          }
          this.setCustomer()
          this.dataObject.id = null
          this.dataObject.code = null
        }
      })
    }
  }
  setCustomer() {
    if (this.dataObject && this.dataObject.customerId && this.dataCustomer.length > 0) {
      const customer = this.dataCustomer.find((s) => s.id === this.dataObject.customerId)
      if (customer) {
        this.dataObject.customer = customer
        this.dataObject.customerId = customer.id
        this.dataObject.customerCode = customer.code
      }
    }
  }
  onChangeCustomer() {
    if (this.dataObject.customer) {
      this.dataObject.customerId = this.dataObject.customer.id
      this.dataObject.customerCode = this.dataObject.customer.code
    }
  }
}
