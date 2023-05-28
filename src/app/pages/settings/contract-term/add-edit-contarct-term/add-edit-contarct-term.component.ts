import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { ApiService } from '../../../../services/api.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-add-edit-contarct-term',
  templateUrl: './add-edit-contarct-term.component.html',
})
export class AddEditContarctTermComponent implements OnInit {
  enumData: any
  dataObject: any
  isEditItem = false

  validDate: any = Date
  // dataCustomer: any [] = []
  // dataContract: any [] = []

  modelTitle = ''
  dataServiceType: any = []
  lstTransportType: any = []

  constructor(
    private coreService: CoreService,
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddEditContarctTermComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dataParent: any
  ) {}

  ngOnInit(): void {
    if (this.dataParent && this.dataParent.id) {
      this.modelTitle = 'Cập nhật phụ lục hợp đồng'
      this.isEditItem = true
      this.dataObject = this.dataParent
    } else {
      this.validDate = new Date()
      this.dataObject = this.dataParent || {}
      this.modelTitle = 'Thêm mới phụ lục hợp đồng'
      this.validDate.setDate(this.validDate.getDate() - 1)
    }
    this.dataServiceType = this.coreService.convertObjToArray(enumData.ServiceType)
    this.lstTransportType = this.coreService.convertObjToArray(enumData.TransportType)
  }

  disabledDate = (current: Date): boolean => {
    return current < this.validDate
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    if (data.effectDate > data.expireDate) {
      this.notifyService.showError(`Ngày có hiệu lực không thể lớn hơn ngày hết hạn`)
      this.notifyService.hideloading()
      return
    }
    this.apiService.post(this.apiService.CUSTOMER_CONTRACT_TERM.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  addObject(data: any) {
    this.notifyService.showloading()
    if (data.effectDate > data.expireDate) {
      this.notifyService.hideloading()
      this.notifyService.showError(`Ngày có hiệu lực không thể lớn hơn ngày hết hạn`)
      return
    }
    this.apiService.post(this.apiService.CUSTOMER_CONTRACT_TERM.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }

  onSave() {
    const data = this.dataObject
    data.customerContractId = this.dataParent?.customerContract?.id
    data.customerId = this.dataParent?.customerContract?.customerId
    if (data.id && data.id !== '') {
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  clear() {
    this.dataObject = new Object()
  }
}
