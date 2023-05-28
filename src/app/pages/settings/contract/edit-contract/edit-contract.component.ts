import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { ApiService } from '../../../../services/api.service'
import { NotifyService } from '../../../../services/notify.service'
@Component({
  selector: 'app-add-or-edit-contract',
  templateUrl: './edit-contract.component.html',
})
export class EditContractComponent implements OnInit {
  enumData: any
  dataObject: any
  isEditItem = false

  lstCustomer: any[] = []
  modelTitle = 'CẬP NHẬT HỢP ĐỒNG'

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<EditContractComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadDataSearch()
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.isEditItem = true
    } else {
      this.dataObject = new Object()
    }
  }

  loadDataSearch() {
    Promise.all([this.apiService.post(this.apiService.CUSTOMER.FIND, { where: { isDeleted: false } })]).then(
      async (res) => {
        this.lstCustomer = res[0] || []
      }
    )
  }

  onSave() {
    const data = this.dataObject
    if (data.id && data.id !== '') {
      this.updateObject(data)
      return
    }
  }

  updateObject(data: any) {
    if (data.signDate > data.effectDate) {
      this.notifyService.showError(`Ngày kí không thể lớn hơn ngày có hiệu lực`)
      this.notifyService.hideloading()
      return
    }
    if (data.effectDate > data.expireDate) {
      this.notifyService.showError(`Ngày có hiệu lực không thể lớn hơn ngày hết hạn`)
      this.notifyService.hideloading()
      return
    }

    if (data.signDate > data.expireDate) {
      this.notifyService.showError(`Ngày kí không thể lớn hơn ngày hết hạn`)
      this.notifyService.hideloading()
      return
    }
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CONTRACT.UPDATE, data).then((result) => {
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
}
