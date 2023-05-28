import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { enumData } from '../../../../core/enumData';
import { ApiService } from '../../../../services/api.service';
import { NotifyService } from '../../../../services/notify.service';

@Component({
  selector: 'app-add-or-edit-customer',
  templateUrl: './add-or-edit-customer.component.html',
})
export class AddOrEditCustomerComponent implements OnInit {
  enumData: any
  dataObject: any
  isEditItem = false

  modelTitle = 'THÊM MỚI KHÁCH HÀNG'
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddOrEditCustomerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
) { }

ngOnInit() {
  if (this.data && this.data !== null) {
    this.dataObject = this.data
    this.modelTitle = 'Chỉnh sửa khách hàng'
    this.isEditItem = true
  } else {
    this.dataObject = new Object()
  }
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

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  addObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER.CREATE, data).then((result) => {
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
}
