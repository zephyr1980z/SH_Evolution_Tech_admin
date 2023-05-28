import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
@Component({
  selector: 'app-add-or-edit-costs-incurred',
  templateUrl: './add-or-edit-costs-incurred.component.html',
})
export class AddOrEditCostsIncurredComponent implements OnInit {
  enumData: any
  dataObject: any
  isEditItem = false

  validDate: any = Date
  dataCustomer: any[] = []
  currentUser: User | any
  modelTitle = 'THÊM MỚI CHI PHÍ'
  costsIncurredType: any = []
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddOrEditCostsIncurredComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    if (this.data && this.data !== null) {
      this.dataObject = this.data
      this.isEditItem = true
      this.modelTitle = 'CẬP NHẬT CHI PHÍ'
    } else {
      this.validDate = new Date()
      this.dataObject = new Object()
      this.validDate.setDate(this.validDate.getDate() - 1)
    }
    this.costsIncurredType = this.coreService.convertObjToArray(this.enumData.CostsIncurredType)
  }

  disabledDate = (current: Date): boolean => {
    return current < this.validDate
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
    this.apiService.post(this.apiService.COSTS_INCURRED.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  addObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.COSTS_INCURRED.CREATE, data).then((result) => {
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
