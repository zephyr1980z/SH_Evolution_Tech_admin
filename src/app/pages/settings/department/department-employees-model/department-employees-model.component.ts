import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { ApiService } from '../../../../services/api.service'
import { NotifyService } from '../../../../services/notify.service'
import { enumData } from '../../../../core/enumData'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

declare var Object: any
@Component({
  selector: 'app-department-employees-model',
  templateUrl: './department-employees-model.component.html',
})
export class DepartmentEmployeesModelComponent implements OnInit {
  dataObject: any
  isEditItem = false
  dataEmployees: any[] = []
  isLoadEmployees = false
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.dataObject = this.data
    if (this.dataObject) {
      this.notifyService.showloading()
      await this.apiService
        .post(this.apiService.EMPLOYEE.FIND, { isDeleted: false, departmentId: this.dataObject.id })
        .then((result) => {
          this.notifyService.hideloading()
          this.dataEmployees = result
          this.isLoadEmployees = true
        })
    }
  }

  clear() {
    this.dataObject = new Object()
  }
}
