import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { enumData } from '../../../../core/enumData';
import { ApiService } from '../../../../services/api.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { CoreService } from '../../../../services/core.service';
import { NotifyService } from '../../../../services/notify.service';

@Component({
  selector: 'app-add-or-edit-vendor',
  templateUrl: './add-or-edit-vendor.component.html',
})
export class AddOrEditVendorComponent implements OnInit {
  enumData: any
  dataObject: any
  isEditItem = false

  modelTitle = 'THÊM MỚI NHÀ XE NGOÀI'
  constructor(
    private authenticationService: AuthenticationService,
    private notifyService: NotifyService,
    private coreService: CoreService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddOrEditVendorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
) { }

  ngOnInit(): void {
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.modelTitle = 'CẬP NHẬT THÔNG TIN NHÀ XE NGOÀI'
      this.isEditItem = true
    } else {
      this.dataObject = new Object()
    }
  }

  onSave(){
    const data = this.dataObject
    data.isDeleted = false
    if (data.id && data.id !== '') {
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.VENDOR.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  addObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.VENDOR.CREATE, data).then((result) => {
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
