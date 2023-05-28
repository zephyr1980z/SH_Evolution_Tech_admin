import { Component, OnInit, Optional, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ApiService } from '../../../../services/api.service'
import { NotifyService } from '../../../../services/notify.service'
import { enumData } from '../../../../core/enumData'
@Component({
  selector: 'app-add-or-edit-employee-model',
  templateUrl: './add-or-edit-employee-model.component.html',
})
export class AddOrEditEmployeeModelComponent implements OnInit {
  dataObject: any
  isEditItem = false
  dataDepartment: any = []
  modelTitle = 'Thêm mới nhân viên'
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddOrEditEmployeeModelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.loadDepartment()
    if (this.data && this.data !== null) {
      this.modelTitle = 'Cập nhật nhân viên'
      this.isEditItem = true
      this.dataObject = this.data
    } else {
      this.dataObject = new Object()
    }
  }

  loadDepartment() {
    this.notifyService.showloading()
    this.apiService
      .post(this.apiService.DEPARTMENT.FIND, { isDeleted: false, departmentType: enumData.DepartmentType.TMS.code })
      .then((result) => {
        this.notifyService.hideloading()
        this.dataDepartment = result
      })
  }

  clear() {
    this.dataObject = new Object()
  }

  onSave() {
    const data = this.dataObject
    data.isDeleted = false
    if (data.id && data.id !== '') {
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  addObject(data: any) {
    data.employeeType = enumData.EmployeeType.TMS.code
    if (data.password !== data.confimPassword) {
      this.notifyService.showError('Mật khẩu không khớp!')
      return
    }
    this.notifyService.showloading()
    this.apiService.post(this.apiService.EMPLOYEE.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.EMPLOYEE.UPDATE, data).then((result) => {
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
